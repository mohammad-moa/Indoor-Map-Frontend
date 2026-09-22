"use client";

import { Map2D } from '@/components/Map';
import { floors } from '@/data/floors';
import { landmarks } from '@/data/landmarks';
import { navigationGraph } from '@/data/navigationGraph';
import { usePdrPosition } from '@/hooks/usePdrPosition';
import { getRoute } from '@/services/navigation';

const NavigationPage = () => {
  const floor = floors[0];
  const { position, isTracking, start, stop, reset } = usePdrPosition();

  const route = getRoute({
    position,
    destinationId: "room-102",
  });

  const floorLandmarks = landmarks.filter(
    (landmark) => landmark.floorId === floor.id,
  );

  const floorGraph = {
    nodes: navigationGraph.nodes.filter((node) => node.floorId === floor.id),

    edges: navigationGraph.edges.filter((edge) => {
      const from = navigationGraph.nodes.find((node) => node.id === edge.from);

      const to = navigationGraph.nodes.find((node) => node.id === edge.to);

      return from?.floorId === floor.id && to?.floorId === floor.id;
    }),
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Hospital Indoor Navigation</h1>

        <Map2D
          width={floor.width}
          height={floor.height}
          graph={floorGraph}
          landmarks={floorLandmarks}
          route={route}
          position={position}
        />

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
        </div>

        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <p>
            Position: {position.x.toFixed(1)}, {position.y.toFixed(1)}
          </p>

          {route && <p className="mt-1">Distance: {route.distance} m</p>}
        </div>
      </div>
    </main>
  );
};
export default NavigationPage;
