"use client";

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Canvas } from '@react-three/fiber';
import {
  createXRStore,
  XR,
} from '@react-three/xr';

function Arrow() {
  return (
    <group position={[0, -0.5, -2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshBasicMaterial color="#00aaff" transparent opacity={0.9} />
      </mesh>

      <mesh position={[0, 0, -0.7]}>
        <coneGeometry args={[0.28, 0.55, 4]} />
        <meshBasicMaterial color="#00aaff" transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

export const ARNavigation = () => {
  const store = useMemo(() => createXRStore(), []);

  const [supported, setSupported] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      if (!navigator.xr) {
        setSupported(false);
        return;
      }

      try {
        const result = await navigator.xr.isSessionSupported("immersive-ar");

        setSupported(result);
      } catch {
        setSupported(false);
      }
    };

    checkSupport();
  }, []);

  const startAR = async () => {
    try {
      setError(null);
      await store.enterAR();
    } catch (err) {
      console.error(err);

      setError("امکان اجرای AR روی این دستگاه یا مرورگر وجود ندارد.");
    }
  };

  if (supported === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        در حال بررسی پشتیبانی از AR...
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="mb-3 text-xl font-bold">AR پشتیبانی نمی‌شود</h1>

          <p className="text-gray-500">
            این دستگاه یا مرورگر از WebXR Immersive AR پشتیبانی نمی‌کند.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <button
        onClick={startAR}
        className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
      >
        شروع AR
      </button>

      {error && (
        <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-xl bg-red-500 px-5 py-3 text-center text-white">
          {error}
        </div>
      )}

      <Canvas
        camera={{
          position: [0, 0, 0],
          fov: 70,
        }}
      >
        <XR store={store}>
          <ambientLight intensity={1} />

          <Arrow />
        </XR>
      </Canvas>
    </div>
  );
};
