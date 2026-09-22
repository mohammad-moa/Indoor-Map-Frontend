"use client";

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import { getRoute } from '@/services/navigation';
import { getPositionFromQR } from '@/services/positioning';
import { QRPayload } from '@/types';
import type { Landmark } from '@/types/map';
import type {
  NavigationGraph,
  Route,
} from '@/types/navigation';
import type { Position } from '@/types/position';
import {
  getRemainingDistance,
  isArrived,
  isOffRoute,
} from '@/utils/navigation';

interface UseNavigationParams {
  landmarks: Landmark[];
  graph: NavigationGraph;
  initialPosition: Position;
}

export function useNavigation({
  landmarks,
  graph,
  initialPosition,
}: UseNavigationParams) {
  const [position, setPosition] = useState<Position>(initialPosition);

  const [destinationId, setDestinationId] = useState<string | null>(null);

  const [route, setRoute] = useState<Route | null>(null);

  const destination = useMemo(() => {
    if (!destinationId) {
      return null;
    }

    return landmarks.find((landmark) => landmark.id === destinationId) ?? null;
  }, [destinationId, landmarks]);

  const updatePosition = useCallback(
    (nextPosition: Position) => {
      setPosition(nextPosition);

      if (!destinationId) {
        return;
      }

      if (!route) {
        const nextRoute = getRoute({
          position: nextPosition,
          destinationId,
        });

        setRoute(nextRoute);

        return;
      }

      const arrivedAtDestination = destination
        ? isArrived(nextPosition, destination)
        : false;

      if (arrivedAtDestination) {
        return;
      }

      const offRoute = isOffRoute(nextPosition, route, graph);

      if (!offRoute) {
        return;
      }

      const newRoute = getRoute({
        position: nextPosition,
        destinationId,
      });

      setRoute(newRoute);
    },
    [destinationId, destination, route, graph],
  );

  const setPositionFromQR = useCallback((payload: QRPayload) => {
    const qrPosition = getPositionFromQR(payload);
    console.log(qrPosition);

    if (!qrPosition) {
      return false;
    }

    setPosition(qrPosition);

    setDestinationId(payload.destinationId);

    const newRoute = getRoute({
      position: qrPosition,
      destinationId: payload.destinationId,
    });

    setRoute(newRoute);

    return true;
  }, []);

  const selectDestination = useCallback(
    (nextDestinationId: string) => {
      const nextRoute = getRoute({
        position,
        destinationId: nextDestinationId,
      });

      setDestinationId(nextDestinationId);

      setRoute(nextRoute);
    },
    [position],
  );

  const clearDestination = useCallback(() => {
    setDestinationId(null);
    setRoute(null);
  }, []);

  const remainingDistance = useMemo(() => {
    if (!route) {
      return null;
    }

    return getRemainingDistance(position, route, graph);
  }, [position, route, graph]);

  const arrived = useMemo(() => {
    if (!destination) {
      return false;
    }

    return isArrived(position, destination);
  }, [position, destination]);

  const offRoute = useMemo(() => {
    if (!route) {
      return false;
    }

    return isOffRoute(position, route, graph);
  }, [position, route, graph]);

  return {
    position,
    destinationId,
    destination,

    route,

    remainingDistance,
    arrived,
    offRoute,

    updatePosition,
    setPositionFromQR,
    selectDestination,
    clearDestination,
  };
}
