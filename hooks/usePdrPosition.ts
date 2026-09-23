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

// حداقل فاصله بین دو قدم
const MIN_STEP_INTERVAL = 350;

// آستانه تشخیص حرکت
const STEP_THRESHOLD = 1.8;

// مقدار لازم برای اینکه بفهمیم بعد از قله وارد فاز نزولی شده‌ایم
const PEAK_DROP = 0.4;

interface UsePdrPositionOptions {
  onPositionChange?: (position: Position) => void;
}

export function usePdrPosition({
  onPositionChange,
}: UsePdrPositionOptions = {}) {
  const [position, setPosition] = useState<Position>(INITIAL_POSITION);

  const [isTracking, setIsTracking] = useState(false);

  const lastStepTime = useRef(0);

  const previousMagnitude = useRef(0);

  const peakMagnitude = useRef(0);

  const heading = useRef(0);

  const onPositionChangeRef = useRef(onPositionChange);

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    if (!isTracking) {
      return;
    }

    function handleMotion(event: DeviceMotionEvent) {
      const acceleration = event.acceleration;

      const accelerationWithGravity = event.accelerationIncludingGravity;

      /*
       * ترجیح می‌دهیم از acceleration بدون gravity
       * استفاده کنیم.
       *
       * بعضی مرورگرها ممکن است آن را null بدهند،
       * بنابراین fallback داریم.
       */
      const source = acceleration ?? accelerationWithGravity;

      if (!source) {
        return;
      }

      const x = source.x ?? 0;
      const y = source.y ?? 0;
      const z = source.z ?? 0;

      const magnitude = Math.sqrt(x * x + y * y + z * z);

      const now = Date.now();

      const isRising = magnitude > previousMagnitude.current;

      const isFalling = magnitude < previousMagnitude.current - PEAK_DROP;

      const enoughTimePassed = now - lastStepTime.current > MIN_STEP_INTERVAL;

      /*
       * وقتی مقدار شتاب بالا می‌رود،
       * بزرگ‌ترین مقدار را به عنوان peak نگه می‌داریم.
       */
      if (isRising) {
        peakMagnitude.current = Math.max(peakMagnitude.current, magnitude);
      }

      /*
       * وقتی بعد از peak شروع به پایین آمدن کرد،
       * بررسی می‌کنیم آیا peak به اندازه کافی بزرگ بوده.
       */
      if (
        isFalling &&
        peakMagnitude.current > STEP_THRESHOLD &&
        enoughTimePassed
      ) {
        lastStepTime.current = now;

        movePosition();

        peakMagnitude.current = 0;
      }

      previousMagnitude.current = magnitude;
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

      setPosition((current) => {
        const nextPosition: Position = {
          ...current,
          x: current.x + deltaX,
          y: current.y + deltaY,
          timestamp: Date.now(),
        };

        onPositionChangeRef.current?.(nextPosition);

        return nextPosition;
      });
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

    const nextPosition: Position = {
      ...INITIAL_POSITION,
      timestamp: Date.now(),
    };

    setPosition(nextPosition);

    onPositionChangeRef.current?.(nextPosition);
  }

  return {
    position,
    isTracking,
    start,
    stop,
    reset,
  };
}
