"use client";

import {
  useCallback,
  useState,
} from 'react';

import { Map2D } from '@/components/Map';
import { EventButtons } from '@/components/Survey';
import {
  floors,
  landmarks,
  navigationGraph,
} from '@/data';
import {
  usePdrPosition,
  useSensorLogger,
} from '@/hooks';
import {
  createSurveySession,
  exportSurveySession,
} from '@/services/survey';
import type {
  SensorSample,
  SurveyEvent,
  SurveyEventType,
  SurveySession,
} from '@/types';
import {
  getAverageError,
  getMaxError,
  getMinError,
  getP90Error,
  getPositionError,
  getSurveyErrors,
} from '@/utils';

const SurveyPage = () => {
  const floor = floors[0];

  const [session, setSession] = useState<SurveySession | null>(null);

  const [events, setEvents] = useState<SurveyEvent[]>([]);
  const [pendingEventType, setPendingEventType] =
    useState<SurveyEventType | null>(null);

  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

  const surveyErrors = getSurveyErrors(events);

  const averageError = getAverageError(surveyErrors);

  const maxError = getMaxError(surveyErrors);

  const minError = getMinError(surveyErrors);

  const p90Error = getP90Error(surveyErrors);

  const { position, isTracking, start, stop } = usePdrPosition();

  const handleSensorSample = useCallback((sample: SensorSample) => {
    setSession((current) => {
      if (!current) {
        return null;
      }

      return {
        ...current,
        sensorSamples: [...current.sensorSamples, sample],
      };
    });
  }, []);

  const { sampleCount } = useSensorLogger({
    enabled: isTracking,
    onSample: handleSensorSample,
  });

  const handleStart = useCallback(() => {
    const newSession = createSurveySession(floor.id);

    setSession(newSession);
    setEvents([]);

    start();
  }, [floor.id, start]);

  const handleStop = useCallback(() => {
    stop();

    setSession((current) => {
      if (!current) {
        return null;
      }

      return {
        ...current,
        finishedAt: Date.now(),
      };
    });
  }, [stop]);

  const handleEvent = useCallback(
    (type: SurveyEventType) => {
      if (!session) {
        return;
      }

      const event: SurveyEvent = {
        id: crypto.randomUUID(),
        type,
        timestamp: Date.now(),

        estimatedPosition: {
          x: position.x,
          y: position.y,
          floorId: position.floorId,
        },
      };

      setEvents((current) => [...current, event]);

      setSession((current) => {
        if (!current) {
          return null;
        }

        return {
          ...current,
          events: [...current.events, event],
        };
      });

      setPendingEventId(event.id);
      setPendingEventType(type);
    },
    [session, position],
  );

  const handleGroundTruthSelect = useCallback(
    (mapPosition: { x: number; y: number }) => {
      if (!pendingEventId) {
        return;
      }

      const groundTruthPosition = {
        x: mapPosition.x,
        y: mapPosition.y,
        floorId: position.floorId,
      };

      setEvents((current) =>
        current.map((event) =>
          event.id === pendingEventId
            ? {
                ...event,
                groundTruthPosition,
              }
            : event,
        ),
      );

      setSession((current) => {
        if (!current) {
          return null;
        }

        return {
          ...current,
          events: current.events.map((event) =>
            event.id === pendingEventId
              ? {
                  ...event,
                  groundTruthPosition,
                }
              : event,
          ),
        };
      });

      setPendingEventId(null);
      setPendingEventType(null);
    },
    [pendingEventId, position.floorId],
  );

  const handleExport = useCallback(() => {
    if (!session) {
      return;
    }

    exportSurveySession(session);
  }, [session]);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Hospital Survey</h1>

          <p className="mt-1 text-sm text-gray-500">
            ثبت مسیر، سنسورها و نقاط مهم محیط
          </p>
        </div>

        {/* Start */}
        {!session && (
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4">
              <h2 className="font-semibold">شروع Survey</h2>

              <p className="mt-1 text-sm text-gray-500">طبقه: {floor.name}</p>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="rounded-lg bg-black px-5 py-3 font-medium text-white"
            >
              شروع Survey
            </button>
          </div>
        )}

        {/* Active Survey */}
        {session && (
          <>
            {/* Status */}
            <div className="rounded-xl border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">وضعیت Survey</h2>

                <span
                  className={
                    isTracking
                      ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                      : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  }
                >
                  {isTracking ? "● Tracking" : "● Stopped"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-gray-500">Floor</div>

                  <div className="mt-1 font-medium">{position.floorId}</div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-gray-500">Position</div>

                  <div className="mt-1 font-medium">
                    {position.x.toFixed(2)}, {position.y.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-gray-500">Events</div>

                  <div className="mt-1 font-medium">{events.length}</div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-gray-500">Sensor Samples</div>

                  <div className="mt-1 font-medium">{sampleCount}</div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-xl border bg-white">
              <div className="border-b px-4 py-3">
                <h2 className="font-semibold">مسیر و موقعیت</h2>
              </div>

              {pendingEventType && (
                <div className="border-b bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  📍 محل واقعی <strong>{pendingEventType}</strong> را روی نقشه
                  انتخاب کنید.
                </div>
              )}

              <Map2D
                width={floor.width}
                height={floor.height}
                landmarks={landmarks}
                graph={navigationGraph}
                route={null}
                position={position}
                surveyEvents={events}
                onMapClick={handleGroundTruthSelect}
              />
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="mb-4">
                <h2 className="font-semibold">Survey Summary</h2>

                <p className="mt-1 text-sm text-gray-500">
                  آمار خطای موقعیت‌یابی ثبت‌شده در این Survey
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Events</div>

                  <div className="mt-1 text-xl font-semibold">
                    {events.length}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Ground Truth</div>

                  <div className="mt-1 text-xl font-semibold">
                    {surveyErrors.length}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Average Error</div>

                  <div className="mt-1 text-xl font-semibold">
                    {averageError !== null ? averageError.toFixed(2) : "—"}
                  </div>

                  <div className="text-xs text-gray-400">units</div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">P90 Error</div>

                  <div className="mt-1 text-xl font-semibold">
                    {p90Error !== null ? p90Error.toFixed(2) : "—"}
                  </div>

                  <div className="text-xs text-gray-400">units</div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Max Error</div>

                  <div className="mt-1 text-xl font-semibold">
                    {maxError !== null ? maxError.toFixed(2) : "—"}
                  </div>

                  <div className="text-xs text-gray-400">units</div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Min Error</div>

                  <div className="mt-1 text-xl font-semibold">
                    {minError !== null ? minError.toFixed(2) : "—"}
                  </div>

                  <div className="text-xs text-gray-400">units</div>
                </div>
              </div>
            </div>

            {/* Event Buttons */}
            <div className="rounded-xl border bg-white p-4">
              <div className="mb-3">
                <h2 className="font-semibold">ثبت Event</h2>

                <p className="mt-1 text-sm text-gray-500">
                  هنگام رسیدن به نقاط مهم مسیر، Event مربوطه را ثبت کنید.
                </p>
              </div>

              <EventButtons onEvent={handleEvent} />
            </div>

            {/* Events */}
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-3 font-semibold">Eventهای ثبت‌شده</h2>

              {events.length === 0 ? (
                <p className="text-sm text-gray-500">
                  هنوز Eventای ثبت نشده است.
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((event, index) => {
                    const error = event.groundTruthPosition
                      ? getPositionError(
                          event.estimatedPosition,
                          event.groundTruthPosition,
                        )
                      : null;

                    return (
                      <div key={event.id} className="rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">
                            {index + 1}. {event.type}
                          </div>

                          {error !== null && (
                            <div className="font-semibold text-orange-600">
                              Error: {error.toFixed(2)} units
                            </div>
                          )}
                        </div>

                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <div>
                            Estimated: {event.estimatedPosition.x.toFixed(2)},{" "}
                            {event.estimatedPosition.y.toFixed(2)}
                          </div>

                          {event.groundTruthPosition && (
                            <div>
                              Ground Truth:{" "}
                              {event.groundTruthPosition.x.toFixed(2)},{" "}
                              {event.groundTruthPosition.y.toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {isTracking && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white"
                >
                  پایان Survey
                </button>
              )}

              {!isTracking && (
                <button
                  type="button"
                  onClick={handleExport}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white"
                >
                  Export JSON
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};
export default SurveyPage;
