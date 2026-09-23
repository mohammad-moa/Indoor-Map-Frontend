"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getRoute } from '@/services/navigation';
import { getPositionFromQR } from '@/services/positioning';
import type { QRPayload } from '@/types';
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

  /*
   * Prevent repeated re-routing while the user
   * remains outside the same route.
   *
   * This becomes false again when the user returns
   * to the route.
   */
  const wasOffRouteRef = useRef(false);

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

      /*
       * If there is no route yet, create one.
       */
      if (!route) {
        const nextRoute = getRoute({
          position: nextPosition,
          destinationId,
        });

        setRoute(nextRoute);

        wasOffRouteRef.current = false;

        return;
      }

      /*
       * Check arrival before checking off-route.
       */
      const arrivedAtDestination = destination
        ? isArrived(nextPosition, destination)
        : false;

      if (arrivedAtDestination) {
        wasOffRouteRef.current = false;

        return;
      }

      const currentlyOffRoute = isOffRoute(nextPosition, route, graph);

      /*
       * User is back on the route.
       *
       * Reset the re-routing guard so that if
       * the user leaves the route again later,
       * another re-route is allowed.
       */
      if (!currentlyOffRoute) {
        wasOffRouteRef.current = false;

        return;
      }

      /*
       * User is outside the route.
       *
       * If we already re-routed for this
       * off-route state, don't calculate A*
       * again on every PDR update.
       */
      if (wasOffRouteRef.current) {
        return;
      }

      wasOffRouteRef.current = true;

      /*
       * Calculate a new route from the user's
       * current position to the same destination.
       */
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

    /*
     * QR gives us a new trusted starting point.
     */
    wasOffRouteRef.current = false;

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

      /*
       * A new destination means a completely
       * new navigation session.
       */
      wasOffRouteRef.current = false;
    },
    [position],
  );

  const clearDestination = useCallback(() => {
    setDestinationId(null);
    setRoute(null);

    wasOffRouteRef.current = false;
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
