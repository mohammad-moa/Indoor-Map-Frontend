"use client";

import {
  useMemo,
  useRef,
} from 'react';

import {
  Group,
  Matrix4,
  Vector3,
} from 'three';

import {
  Canvas,
  useFrame,
} from '@react-three/fiber';
import {
  createXRStore,
  useXRHitTest,
  XR,
} from '@react-three/xr';

const matrixHelper = new Matrix4();
const hitPosition = new Vector3();

function Arrow() {
  const groupRef = useRef<Group>(null);

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (results.length === 0 || !groupRef.current) {
        return;
      }

      getWorldMatrix(matrixHelper, results[0]);

      hitPosition.setFromMatrixPosition(matrixHelper);
    },
    "viewer",
    "plane",
  );

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.position.lerp(hitPosition, 0.2);
  });

  return (
    <group ref={groupRef}>
      {/* Arrow body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.8, 0.16]} />

        <meshBasicMaterial color="#00aaff" />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.32, 0.5, 4]} />

        <meshBasicMaterial color="#00aaff" />
      </mesh>
    </group>
  );
}

export const ARNavigation = () => {
  const store = useMemo(
    () =>
      createXRStore({
        hitTest: true,
      }),
    [],
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <button
        onClick={() => store.enterAR()}
        className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
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
    </div>
  );
};
