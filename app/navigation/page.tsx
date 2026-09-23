/* eslint-disable react-hooks/purity */
"use client";

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import { ARScene } from '@/components/AR';
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
import { Canvas } from '@react-three/fiber';
import {
  createXRStore,
  XR,
} from '@react-three/xr';

const NavigationPage = () => {
  const floor = floors[0];

  const [mapMode, setMapMode] = useState<"2d" | "3d" | "ar">("2d");

  const [arPlaced, setArPlaced] = useState(false);

  const xrStore = useMemo(
    () =>
      createXRStore({
        hitTest: true,
      }),
    [],
  );

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

  const { currentInstruction, distanceToInstruction } =
    useNavigationInstructions(position, route, navigationGraph, arrived);

  /*
   * Calculate the direction of the
   * next route segment.
   */
  const routeAngle = useMemo(() => {
    if (!route || !currentInstruction) {
      return null;
    }

    if (currentInstruction.type === "arrive") {
      return null;
    }

    const nodeIndex = route.nodeIds.findIndex(
      (nodeId) => nodeId === currentInstruction.nodeId,
    );

    if (nodeIndex === -1 || nodeIndex >= route.nodeIds.length - 1) {
      return null;
    }

    const currentNode = navigationGraph.nodes.find(
      (node) => node.id === route.nodeIds[nodeIndex],
    );

    const nextNode = navigationGraph.nodes.find(
      (node) => node.id === route.nodeIds[nodeIndex + 1],
    );

    if (!currentNode || !nextNode) {
      return null;
    }

    const dx = nextNode.x - currentNode.x;

    const dy = nextNode.y - currentNode.y;

    /*
     * Convert map direction to
     * a Three.js-friendly angle.
     */
    return Math.atan2(dx, -dy);
  }, [route, currentInstruction]);

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

  const handleEnterAR = useCallback(() => {
    setArPlaced(false);
    setMapMode("ar");
  }, []);

  const handleStartAR = useCallback(() => {
    xrStore.enterAR();
  }, [xrStore]);

  const handleLeaveAR = useCallback(() => {
    setArPlaced(false);
    setMapMode("2d");
  }, []);

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
            type="button"
            onClick={() => setMapMode("2d")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              mapMode === "2d" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            نقشه 2D
          </button>

          <button
            type="button"
            onClick={() => setMapMode("3d")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              mapMode === "3d" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            نقشه 3D
          </button>

          <button
            type="button"
            onClick={handleEnterAR}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              mapMode === "ar" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            AR
          </button>
        </div>

        {mapMode === "2d" && (
          <Map2D
            width={floor.width}
            height={floor.height}
            landmarks={floorLandmarks}
            graph={navigationGraph}
            route={route}
            position={position}
          />
        )}

        {mapMode === "3d" && (
          <Map3D
            width={floor.width}
            height={floor.height}
            landmarks={floorLandmarks}
            graph={navigationGraph}
            route={route}
            position={position}
          />
        )}

        {mapMode === "ar" && (
          <div
            className="
              relative
              h-[70vh]
              min-h-[500px]
              overflow-hidden
              rounded-xl
              bg-black
            "
          >
            <div
              className="
                absolute
                left-4
                right-4
                top-4
                z-50
                flex
                items-center
                justify-between
                rounded-xl
                bg-black/70
                p-3
                text-white
                backdrop-blur
              "
            >
              <div>
                <div className="text-sm font-semibold">AR Navigation</div>

                <div className="mt-1 text-xs text-white/70">
                  {currentInstruction
                    ? currentInstruction.type === "left"
                      ? "به چپ بپیچید"
                      : currentInstruction.type === "right"
                        ? "به راست بپیچید"
                        : currentInstruction.type === "straight"
                          ? "مستقیم ادامه دهید"
                          : "به مقصد رسیدید"
                    : "در حال انتظار برای مسیر"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLeaveAR}
                className="
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-black
                "
              >
                خروج
              </button>
            </div>

            {!arPlaced && (
              <button
                type="button"
                onClick={handleStartAR}
                className="
                  absolute
                  left-1/2
                  top-24
                  z-50
                  -translate-x-1/2
                  rounded-xl
                  bg-white
                  px-6
                  py-3
                  font-semibold
                  text-black
                  shadow-lg
                "
              >
                شروع AR
              </button>
            )}

            <div
              className="
                absolute
                bottom-6
                left-1/2
                z-50
                -translate-x-1/2
                rounded-lg
                bg-black/70
                px-4
                py-2
                text-xs
                text-white
                backdrop-blur
              "
            >
              {arPlaced
                ? currentInstruction
                  ? currentInstruction.type === "arrive"
                    ? "به مقصد رسیدید"
                    : "راهنمایی فعال است"
                  : "در انتظار دستور مسیریابی"
                : "گوشی را به سمت یک سطح افقی بگیرید"}
            </div>

            <Canvas
              camera={{
                position: [0, 0, 0],
                fov: 70,
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <XR store={xrStore}>
                <ARScene
                  route={route}
                  graph={navigationGraph}
                  position={position}
                  placed={arPlaced}
                  onPlaced={() => setArPlaced(true)}
                />
              </XR>
            </Canvas>
          </div>
        )}

        {mapMode !== "ar" && (
          <div className="mt-4 flex gap-2">
            {!isTracking ? (
              <button
                type="button"
                onClick={start}
                className="
                  rounded-lg
                  bg-blue-600
                  px-4
                  py-2
                  text-white
                "
              >
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="
                  rounded-lg
                  bg-orange-500
                  px-4
                  py-2
                  text-white
                "
              >
                Stop
              </button>
            )}

            <button
              type="button"
              onClick={reset}
              className="
                rounded-lg
                bg-slate-700
                px-4
                py-2
                text-white
              "
            >
              Reset
            </button>
          </div>
        )}

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
