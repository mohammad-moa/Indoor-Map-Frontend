"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { SensorSample } from '@/types';

interface UseSensorLoggerOptions {
  enabled?: boolean;
  onSample?: (sample: SensorSample) => void;
}

export function useSensorLogger({
  enabled = false,
  onSample,
}: UseSensorLoggerOptions = {}) {
  const [sampleCount, setSampleCount] = useState(0);

  const latestHeading = useRef<number | undefined>(undefined);

  const onSampleRef = useRef(onSample);

  useEffect(() => {
    onSampleRef.current = onSample;
  }, [onSample]);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (!enabled) {
        return;
      }

      if (event.alpha == null) {
        return;
      }

      latestHeading.current = event.alpha;
    },
    [enabled],
  );

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      if (!enabled) {
        return;
      }

      const acceleration = event.acceleration;

      const rotationRate = event.rotationRate;

      const sample: SensorSample = {
        timestamp: Date.now(),

        accelerometer: acceleration
          ? {
              x: acceleration.x ?? 0,
              y: acceleration.y ?? 0,
              z: acceleration.z ?? 0,
            }
          : undefined,

        gyroscope: rotationRate
          ? {
              x: rotationRate.alpha ?? 0,
              y: rotationRate.beta ?? 0,
              z: rotationRate.gamma ?? 0,
            }
          : undefined,

        heading: latestHeading.current,
      };

      onSampleRef.current?.(sample);

      setSampleCount((current) => current + 1);
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener("devicemotion", handleMotion);

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);

      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [enabled, handleMotion, handleOrientation]);

  return {
    sampleCount,
  };
}
