/* eslint-disable react-hooks/refs */
"use client";

import { useRef } from 'react';

import {
  Group,
  Matrix4,
  Vector3,
} from 'three';

import type {
  NavigationGraph,
  Route,
} from '@/types/navigation';
import type { Position } from '@/types/position';
import { useFrame } from '@react-three/fiber';
import { useXRHitTest } from '@react-three/xr';

import { ARRouteGuide } from './ARRouteGuide';

const hitTestMatrix = new Matrix4();

const worldPosition = new Vector3();

interface ARSceneProps {
  route: Route | null;

  graph: NavigationGraph;

  position: Position;

  placed: boolean;

  onPlaced: () => void;
}

export function ARScene({
  route,
  graph,
  position,
  placed,
  onPlaced,
}: ARSceneProps) {
  const groupRef = useRef<Group>(null);

  const surfaceYRef = useRef<number | null>(null);

  /*
   * Position at the moment
   * AR is placed.
   *
   * This becomes the local
   * AR coordinate origin.
   */
  const originPositionRef = useRef<Position | null>(null);

  /*
   * World position where
   * the AR origin was placed.
   */
  const originWorldPositionRef = useRef<Vector3 | null>(null);

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (placed) {
        return;
      }

      if (results.length === 0 || !groupRef.current) {
        return;
      }

      const success = getWorldMatrix(hitTestMatrix, results[0]);

      if (!success) {
        return;
      }

      /*
       * Real-world position
       * returned by WebXR.
       */
      worldPosition.setFromMatrixPosition(hitTestMatrix);

      /*
       * Save AR origin.
       */
      surfaceYRef.current = worldPosition.y;

      originWorldPositionRef.current = worldPosition.clone();

      originPositionRef.current = {
        ...position,
      };

      /*
       * Place the AR root
       * at the detected surface.
       */
      groupRef.current.position.copy(worldPosition);

      onPlaced();
    },
    "viewer",
    "plane",
  );

  /*
   * Keep the AR root fixed.
   *
   * IMPORTANT:
   * We intentionally do NOT move it
   * with the camera anymore.
   */
  useFrame(() => {
    if (!placed || !groupRef.current || !originWorldPositionRef.current) {
      return;
    }

    /*
     * The AR root stays where the
     * user initially placed it.
     */
    groupRef.current.position.copy(originWorldPositionRef.current);

    if (surfaceYRef.current !== null) {
      groupRef.current.position.y = surfaceYRef.current;
    }
  });

  /*
   * We need the origin position
   * before displaying the route.
   */
  if (!originPositionRef.current) {
    return <group ref={groupRef} visible={false} />;
  }

  return (
    <group ref={groupRef} visible={placed}>
      <ARRouteGuide
        route={route}
        graph={graph}
        position={position}
        origin={originPositionRef.current}
      />
    </group>
  );
}
