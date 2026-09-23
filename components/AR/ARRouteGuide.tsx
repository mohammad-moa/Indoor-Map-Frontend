/* eslint-disable react-hooks/purity */
"use client";

import {
  useMemo,
  useRef,
} from 'react';

import { Group } from 'three';

import { mapToARLocal } from '@/services/ar';
import type {
  NavigationInstructionType,
} from '@/services/navigation/instructions';
import type {
  NavigationGraph,
  Route,
} from '@/types/navigation';
import type { Position } from '@/types/position';
import { useFrame } from '@react-three/fiber';

import { ARArrow } from './ARArrow';

interface ARRouteGuideProps {
  route: Route | null;
  graph: NavigationGraph;
  position: Position;
  origin: Position;
}

interface ARRoutePoint {
  x: number;
  z: number;
  angle: number;
  instructionType: NavigationInstructionType;
}

const AR_SCALE = 0.5;

const MAX_GUIDE_DISTANCE = 6;

const TURN_THRESHOLD = 30;

/*
 * از چه فاصله‌ای قبل از پیچ،
 * انیمیشن شروع شود.
 */
const TURN_ANIMATION_DISTANCE = 2.5;

function normalizeAngle(angle: number) {
  let value = angle;

  while (value > 180) {
    value -= 360;
  }

  while (value < -180) {
    value += 360;
  }

  return value;
}

function getTurnType(
  previousAngle: number,
  currentAngle: number,
): NavigationInstructionType {
  const difference = normalizeAngle(currentAngle - previousAngle);

  if (Math.abs(difference) <= TURN_THRESHOLD) {
    return "straight";
  }

  return difference > 0 ? "right" : "left";
}

export function ARRouteGuide({
  route,
  graph,
  position,
  origin,
}: ARRouteGuideProps) {
  const arrowRefs = useRef<(Group | null)[]>([]);

  const points = useMemo(() => {
    if (!route || route.nodeIds.length < 2) {
      return [];
    }

    const userLocal = mapToARLocal(position, origin, AR_SCALE);

    const segments: {
      x: number;
      z: number;
      angle: number;
    }[] = [];

    for (let i = 0; i < route.nodeIds.length - 1; i++) {
      const currentNode = graph.nodes.find(
        (node) => node.id === route.nodeIds[i],
      );

      const nextNode = graph.nodes.find(
        (node) => node.id === route.nodeIds[i + 1],
      );

      if (!currentNode || !nextNode) {
        continue;
      }

      const currentLocal = mapToARLocal(
        {
          x: currentNode.x,
          y: currentNode.y,
          floorId: currentNode.floorId,
          source: "mock",
          timestamp: Date.now(),
        },
        origin,
        AR_SCALE,
      );

      const nextLocal = mapToARLocal(
        {
          x: nextNode.x,
          y: nextNode.y,
          floorId: nextNode.floorId,
          source: "mock",
          timestamp: Date.now(),
        },
        origin,
        AR_SCALE,
      );

      const dx = nextLocal.x - currentLocal.x;

      const dz = nextLocal.z - currentLocal.z;

      const length = Math.hypot(dx, dz);

      if (length === 0) {
        continue;
      }

      const angle = Math.atan2(dx, dz);

      segments.push({
        x: (currentLocal.x + nextLocal.x) / 2,

        z: (currentLocal.z + nextLocal.z) / 2,

        angle,
      });
    }

    const result: ARRoutePoint[] = [];

    segments.forEach((segment, index) => {
      const distance = Math.hypot(
        segment.x - userLocal.x,
        segment.z - userLocal.z,
      );

      if (distance > MAX_GUIDE_DISTANCE) {
        return;
      }

      let instructionType: NavigationInstructionType = "straight";

      if (index > 0) {
        instructionType = getTurnType(segments[index - 1].angle, segment.angle);
      }

      result.push({
        ...segment,
        instructionType,
      });
    });

    return result;
  }, [route, graph, position, origin]);

  /*
   * Smooth Turn animation.
   */
  useFrame((_, delta) => {
    points.forEach((point, index) => {
      const arrow = arrowRefs.current[index];

      if (!arrow) {
        return;
      }

      /*
       * Straight arrows don't need
       * special Turn animation.
       */
      if (point.instructionType === "straight") {
        return;
      }

      /*
       * Distance between user and
       * this Arrow.
       */
      const userLocal = mapToARLocal(position, origin, AR_SCALE);

      const distance = Math.hypot(point.x - userLocal.x, point.z - userLocal.z);

      /*
       * 0 = far from Turn
       * 1 = very close to Turn
       */
      const progress = Math.max(
        0,
        Math.min(1, 1 - distance / TURN_ANIMATION_DISTANCE),
      );

      /*
       * Base rotation.
       */
      const targetRotation = point.angle;

      /*
       * Small preview rotation
       * before reaching the Turn.
       */
      const turnPreview =
        point.instructionType === "right"
          ? progress * (Math.PI / 3)
          : -progress * (Math.PI / 3);

      const desiredRotation = targetRotation + turnPreview;

      let difference = desiredRotation - arrow.rotation.y;

      while (difference > Math.PI) {
        difference -= Math.PI * 2;
      }

      while (difference < -Math.PI) {
        difference += Math.PI * 2;
      }

      const smoothing = 1 - Math.exp(-8 * delta);

      arrow.rotation.y += difference * smoothing;
    });
  });

  if (points.length === 0) {
    return null;
  }

  return (
    <group>
      {points.map((point, index) => (
        <group
          key={`${point.x}-${point.z}-${index}`}
          ref={(element) => {
            arrowRefs.current[index] = element;
          }}
          position={[point.x, 0.08, point.z]}
          rotation={[0, point.angle, 0]}
        >
          <ARArrow instructionType={point.instructionType} />
        </group>
      ))}
    </group>
  );
}
