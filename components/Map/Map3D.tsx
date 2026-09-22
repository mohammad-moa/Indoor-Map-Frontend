"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import type { Landmark } from "@/types/map";
import type { NavigationGraph, Route } from "@/types/navigation";
import type { Position } from "@/types/position";

interface Map3DProps {
  width: number;
  height: number;
  landmarks: Landmark[];
  graph: NavigationGraph;
  route: Route | null;
  position: Position;
}

export const Map3D = ({
  width,
  height,
  landmarks,
  graph,
  route,
  position,
}: Map3DProps) => {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-xl bg-slate-900">
      <Canvas
        camera={{
          position: [10, 12, 18],
          fov: 50,
        }}
      >
        <ambientLight intensity={1} />

        <directionalLight position={[10, 15, 10]} intensity={2} />

        <MapFloor width={width} height={height} />

        <MapGraph graph={graph} />

        <MapRoute route={route} graph={graph} />

        <MapLandmarks landmarks={landmarks} />

        <UserMarker position={position} />

        <OrbitControls />
      </Canvas>
    </div>
  );
};

function MapFloor({ width, height }: { width: number; height: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, height / 2]}>
      <planeGeometry args={[width, height]} />

      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
}

function MapGraph({ graph }: { graph: NavigationGraph }) {
  return (
    <>
      {graph.edges.map((edge, index) => {
        const from = graph.nodes.find((node) => node.id === edge.from);

        const to = graph.nodes.find((node) => node.id === edge.to);

        if (!from || !to) {
          return null;
        }

        return (
          <Line3D
            key={`${edge.from}-${edge.to}-${index}`}
            start={[from.x, 0.05, from.y]}
            end={[to.x, 0.05, to.y]}
          />
        );
      })}
    </>
  );
}

function MapRoute({
  route,
  graph,
}: {
  route: Route | null;
  graph: NavigationGraph;
}) {
  if (!route) {
    return null;
  }

  return (
    <>
      {route.nodeIds.slice(0, -1).map((nodeId, index) => {
        const from = graph.nodes.find((node) => node.id === nodeId);

        const to = graph.nodes.find(
          (node) => node.id === route.nodeIds[index + 1],
        );

        if (!from || !to) {
          return null;
        }

        return (
          <Line3D
            key={`${nodeId}-${to.id}`}
            start={[from.x, 0.12, from.y]}
            end={[to.x, 0.12, to.y]}
            thickness={4}
          />
        );
      })}
    </>
  );
}

function MapLandmarks({ landmarks }: { landmarks: Landmark[] }) {
  return (
    <>
      {landmarks.map((landmark) => (
        <mesh key={landmark.id} position={[landmark.x, 0.4, landmark.y]}>
          <boxGeometry args={[0.6, 0.8, 0.6]} />

          <meshStandardMaterial color="#2563eb" />
        </mesh>
      ))}
    </>
  );
}

function UserMarker({ position }: { position: Position }) {
  return (
    <mesh position={[position.x, 0.5, position.y]}>
      <sphereGeometry args={[0.35, 32, 32]} />

      <meshStandardMaterial color="#dc2626" />
    </mesh>
  );
}

function Line3D({
  start,
  end,
  thickness = 2,
}: {
  start: [number, number, number];
  end: [number, number, number];
  thickness?: number;
}) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];

  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  const angle = Math.atan2(dz, dx);

  return (
    <mesh position={midpoint} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, 0.05, thickness / 100]} />

      <meshStandardMaterial color="#64748b" />
    </mesh>
  );
}
