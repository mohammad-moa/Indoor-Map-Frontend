"use client";

import {
  useMemo,
  useRef,
} from 'react';

import { Group } from 'three';

import type {
  NavigationInstructionType,
} from '@/services/navigation/instructions';
import { useFrame } from '@react-three/fiber';

import { ARArrow } from './ARArrow';

interface ARGuideProps {
  instructionType: NavigationInstructionType | null;

  routeAngle: number | null;

  distanceToInstruction: number;
}

const ARROW_COUNT = 3;

const TURN_ANIMATION_DISTANCE = 2.5;

const FLOW_SPEED = 0.8;

export function ARGuide({
  instructionType,
  routeAngle,
  distanceToInstruction,
}: ARGuideProps) {
  const guideRef = useRef<Group>(null);

  const arrowRefs = useRef<(Group | null)[]>([]);

  const flowTimeRef = useRef(0);

  const positions = useMemo(() => {
    switch (instructionType) {
      case "left":
        return [
          [-0.8, 0, -0.8],
          [-0.45, 0, -1.5],
          [0, 0, -2.2],
        ] as const;

      case "right":
        return [
          [0.8, 0, -0.8],
          [0.45, 0, -1.5],
          [0, 0, -2.2],
        ] as const;

      case "straight":
      default:
        return [
          [0, 0, -0.8],
          [0, 0, -1.5],
          [0, 0, -2.2],
        ] as const;
    }
  }, [instructionType]);

  useFrame((_, delta) => {
    flowTimeRef.current += delta * FLOW_SPEED;

    /*
     * هر Arrow کمی با تأخیر
     * نسبت به Arrow قبلی حرکت می‌کند.
     */
    arrowRefs.current.forEach((arrow, index) => {
      if (!arrow) {
        return;
      }

      const phase = flowTimeRef.current - index * 0.9;

      const movement = Math.sin(phase * Math.PI * 2) * 0.12;

      arrow.position.z = positions[index][2] + movement;

      /*
       * کمی بالا و پایین شدن
       * برای حس شناور بودن.
       */
      arrow.position.y = Math.sin(phase * Math.PI * 2) * 0.025;
    });

    /*
     * Turn animation
     */
    if (
      !guideRef.current ||
      routeAngle === null ||
      instructionType === "straight"
    ) {
      return;
    }

    const progress = Math.max(
      0,
      Math.min(1, 1 - distanceToInstruction / TURN_ANIMATION_DISTANCE),
    );

    const currentRotation = guideRef.current.rotation.y;

    let difference = routeAngle - currentRotation;

    while (difference > Math.PI) {
      difference -= Math.PI * 2;
    }

    while (difference < -Math.PI) {
      difference += Math.PI * 2;
    }

    const desiredRotation = currentRotation + difference * progress;

    const smoothing = 1 - Math.exp(-8 * delta);

    guideRef.current.rotation.y +=
      (desiredRotation - guideRef.current.rotation.y) * smoothing;
  });

  if (!instructionType || instructionType === "arrive") {
    return null;
  }

  return (
    <group ref={guideRef}>
      {Array.from({
        length: ARROW_COUNT,
      }).map((_, index) => (
        <group
          key={index}
          ref={(element) => {
            arrowRefs.current[index] = element;
          }}
          position={positions[index]}
          scale={1 - index * 0.12}
        >
          <ARArrow instructionType={instructionType} />
        </group>
      ))}
    </group>
  );
}
