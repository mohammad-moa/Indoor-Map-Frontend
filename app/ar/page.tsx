"use client";

import { useMemo } from 'react';

import { Canvas } from '@react-three/fiber';
import {
  createXRStore,
  XR,
} from '@react-three/xr';

function Arrow() {
  return (
    <group position={[0, 0, -2]}>
      {/* بدنه فلش */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshBasicMaterial color="#00aaff" />
      </mesh>

      {/* سر فلش */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.35, 0.5, 4]} />
        <meshBasicMaterial color="#00aaff" />
      </mesh>
    </group>
  );
}

export default function ARPage() {
  const store = useMemo(() => createXRStore(), []);

  return (
    <main className="fixed inset-0 bg-black">
      <button
        type="button"
        onClick={() => store.enterAR()}
        className="
          absolute
          left-1/2
          top-6
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

      <Canvas
        camera={{
          position: [0, 0, 0],
          fov: 70,
        }}
      >
        <XR store={store}>
          <Arrow />
        </XR>
      </Canvas>
    </main>
  );
}
