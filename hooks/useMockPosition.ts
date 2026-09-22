"use client";

import {
  useEffect,
  useState,
} from 'react';

import type { Position } from '@/types/position';

const INITIAL_POSITION: Position = {
  x: 2,
  y: 2,
  floorId: "floor-1",
  source: "mock",
  accuracy: 1,
  timestamp: Date.now(),
};

export function useMockPosition() {
  const [position, setPosition] = useState<Position>(INITIAL_POSITION);

  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!isMoving) {
      return;
    }

    const interval = setInterval(() => {
      setPosition((current) => {
        const nextX = Math.min(current.x + 0.5, 16);

        return {
          ...current,
          x: nextX,
          timestamp: Date.now(),
        };
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [isMoving]);

  return {
    position,
    isMoving,
    start: () => setIsMoving(true),
    stop: () => setIsMoving(false),
    reset: () => {
      setIsMoving(false);
      setPosition({
        ...INITIAL_POSITION,
        timestamp: Date.now(),
      });
    },
  };
}
