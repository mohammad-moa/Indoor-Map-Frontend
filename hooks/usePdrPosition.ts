"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type { Position } from '@/types/position';

const INITIAL_POSITION: Position = {
  x: 2,
  y: 2,
  floorId: "floor-1",
  source: "pdr",
  accuracy: 2.5,
  timestamp: Date.now(),
};

const STEP_LENGTH = 0.65;
const MIN_STEP_INTERVAL = 350;

export function usePdrPosition() {
  const [position, setPosition] = useState<Position>(INITIAL_POSITION);

  const [isTracking, setIsTracking] = useState(false);

  const lastStepTime = useRef(0);

  const lastAcceleration = useRef(0);

  const heading = useRef(0);

  useEffect(() => {
    if (!isTracking) {
      return;
    }

    function handleMotion(event: DeviceMotionEvent) {
      const acceleration = event.accelerationIncludingGravity;

      if (!acceleration) {
        return;
      }

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;

      const magnitude = Math.sqrt(x * x + y * y + z * z);

      const now = Date.now();

      const isPeak = magnitude > 12 && magnitude > lastAcceleration.current;

      const enoughTimePassed = now - lastStepTime.current > MIN_STEP_INTERVAL;

      if (isPeak && enoughTimePassed) {
        lastStepTime.current = now;

        movePosition();
      }

      lastAcceleration.current = magnitude;
    }

    function handleOrientation(event: DeviceOrientationEvent) {
      if (event.alpha == null) {
        return;
      }

      heading.current = event.alpha;
    }

    function movePosition() {
      const angle = (heading.current * Math.PI) / 180;

      const deltaX = Math.sin(angle) * STEP_LENGTH;

      const deltaY = -Math.cos(angle) * STEP_LENGTH;

      setPosition((current) => ({
        ...current,

        x: current.x + deltaX,

        y: current.y + deltaY,

        timestamp: Date.now(),
      }));
    }

    window.addEventListener("devicemotion", handleMotion);

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);

      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isTracking]);

  function start() {
    setIsTracking(true);
  }

  function stop() {
    setIsTracking(false);
  }

  function reset() {
    setIsTracking(false);

    setPosition({
      ...INITIAL_POSITION,
      timestamp: Date.now(),
    });
  }

  return {
    position,
    isTracking,
    start,
    stop,
    reset,
  };
}
