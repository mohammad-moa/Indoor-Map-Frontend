"use client";

import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Group,
  Matrix4,
} from 'three';

import { Canvas } from '@react-three/fiber';
import {
  createXRStore,
  useXRHitTest,
  XR,
} from '@react-three/xr';

const matrixHelper = new Matrix4();

function Arrow({
  onHitTestResult,
}: {
  onHitTestResult: (count: number) => void;
}) {
  const groupRef = useRef<Group>(null);

  useXRHitTest(
    (results, getWorldMatrix) => {
      onHitTestResult(results.length);

      if (results.length === 0 || !groupRef.current) {
        return;
      }

      const success = getWorldMatrix(matrixHelper, results[0]);

      if (!success) {
        return;
      }

      matrixHelper.decompose(
        groupRef.current.position,
        groupRef.current.quaternion,
        groupRef.current.scale,
      );

      groupRef.current.position.y += 0.15;
    },
    "viewer",
    "plane",
  );

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />

        <meshBasicMaterial color="#00aaff" />
      </mesh>

      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.35, 0.5, 4]} />

        <meshBasicMaterial color="#00aaff" />
      </mesh>
    </group>
  );
}

function DebugPanel({ hitTestResults }: { hitTestResults: number }) {
  return (
    <div className="absolute left-4 top-4 z-50 rounded-xl bg-black/75 px-4 py-3 text-sm text-white">
      <div>
        AR: <span className="text-green-400">Active</span>
      </div>

      <div>
        Hit Test Results: <span className="font-bold">{hitTestResults}</span>
      </div>

      <div className="mt-1 text-xs text-white/70">
        گوشی را آرام به سمت زمین حرکت دهید
      </div>
    </div>
  );
}

export default function ARPage() {
  const store = useMemo(
    () =>
      createXRStore({
        hitTest: true,
      }),
    [],
  );

  const [hitTestResults, setHitTestResults] = useState(0);

  return (
    <main className="fixed inset-0 bg-black">
      <DebugPanel hitTestResults={hitTestResults} />

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
          <Arrow onHitTestResult={setHitTestResults} />
        </XR>
      </Canvas>
    </main>
  );
}
