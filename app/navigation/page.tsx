/* eslint-disable react-hooks/purity */
"use client";

import {
  useCallback,
  useState,
} from 'react';

import {
  Map2D,
  Map3D,
} from '@/components/Map';
import {
  DestinationSelector,
  NavigationView,
} from '@/components/Navigation';
import { QRScanner } from '@/components/QR';
import {
  floors,
  landmarks,
  navigationGraph,
} from '@/data';
import {
  useNavigation,
  useNavigationInstructions,
  usePdrPosition,
} from '@/hooks';
import type { QRPayload } from '@/types';

const NavigationPage = () => {
  const floor = floors[0];

  const [mapMode, setMapMode] = useState<"2d" | "3d">("2d");

  const navigation = useNavigation({
    landmarks,
    graph: navigationGraph,
    initialPosition: {
      x: 2,
      y: 2,
      floorId: "floor-1",
      source: "pdr",
      accuracy: 2.5,
      timestamp: Date.now(),
    },
  });

  const { isTracking, start, stop, reset } = usePdrPosition({
    onPositionChange: navigation.updatePosition,
  });

  const {
    position,
    destinationId,
    route,
    remainingDistance,
    arrived,
    offRoute,
    setPositionFromQR,
    destination,
    selectDestination,
  } = navigation;

  /*
   * Turn-by-turn navigation
   */
  const { currentInstruction, distanceToInstruction } =
    useNavigationInstructions(position, route, navigationGraph, arrived);

  const floorLandmarks = landmarks.filter(
    (landmark) => landmark.floorId === floor.id,
  );

  const handleQRScan = useCallback(
    (payload: QRPayload) => {
      const success = setPositionFromQR(payload);

      if (!success) {
        return;
      }

      console.log("QR scanned:", payload);
    },
    [setPositionFromQR],
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Hospital Indoor Navigation</h1>

        <DestinationSelector
          landmarks={floorLandmarks}
          selectedDestinationId={destinationId}
          onSelect={(id) => selectDestination(id)}
        />

        <QRScanner onScan={handleQRScan} />

        <div className="mb-3 flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setMapMode("2d")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              mapMode === "2d" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            نقشه 2D
          </button>

          <button
            onClick={() => setMapMode("3d")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              mapMode === "3d" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            نقشه 3D
          </button>
        </div>

        {mapMode === "2d" ? (
          <Map2D
            width={floor.width}
            height={floor.height}
            landmarks={floorLandmarks}
            graph={navigationGraph}
            route={route}
            position={position}
          />
        ) : (
          <Map3D
            width={floor.width}
            height={floor.height}
            landmarks={floorLandmarks}
            graph={navigationGraph}
            route={route}
            position={position}
          />
        )}

        <div className="mt-4 flex gap-2">
          {!isTracking ? (
            <button
              onClick={start}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="rounded-lg bg-orange-500 px-4 py-2 text-white"
            >
              Stop
            </button>
          )}

          <button
            onClick={reset}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white"
          >
            Reset
          </button>

          {/* 
          <button
            onClick={() =>
              setPositionFromQR({
                sourceId: "location-a",
                destinationId: "room-102",
              })
            }
            className="rounded-lg bg-green-600 px-4 py-2 text-white"
          >
            Test QR → Room 102
          </button>
          */}
        </div>

        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          {destination && (
            <NavigationView
              instructionType={currentInstruction?.type ?? null}
              distanceToInstruction={distanceToInstruction}
              remainingDistance={remainingDistance ?? 0}
              destinationName={destination.name}
              arrived={arrived}
              offRoute={offRoute}
            />
          )}

          {arrived ? (
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                به مقصد رسیدید
              </div>

              <p className="mt-1 text-sm text-gray-500">
                مسیر‌یابی با موفقیت به پایان رسید.
              </p>
            </div>
          ) : destination ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">مقصد</div>

              <div className="text-lg font-semibold">{destination.name}</div>

              {remainingDistance !== null && (
                <div className="text-sm text-gray-600">
                  فاصله باقی‌مانده: {remainingDistance.toFixed(1)} واحد
                </div>
              )}

              {offRoute && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  از مسیر خارج شدید؛ در حال محاسبه مسیر جدید...
                </div>
              )}

              {!offRoute && (
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">
                  در حال مسیریابی به مقصد...
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              برای شروع مسیریابی، یک QR را اسکن کنید.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default NavigationPage;
