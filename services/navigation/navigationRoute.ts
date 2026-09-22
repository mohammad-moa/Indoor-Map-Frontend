import {
  landmarks,
  navigationGraph,
} from '@/data';
import type {
  Position,
  Route,
} from '@/types';

import { findPath } from './pathfinding';

interface GetRouteParams {
  position: Position;
  destinationId: string;
}

/**
 * Creates a navigation route from the user's current position
 * to a destination landmark.
 */
export function getRoute({
  position,
  destinationId,
}: GetRouteParams): Route | null {
  const destination = landmarks.find(
    (landmark) => landmark.id === destinationId,
  );

  if (!destination) {
    return null;
  }

  if (destination.floorId !== position.floorId) {
    return null;
  }

  const nearestNode = findNearestNode(position, navigationGraph.nodes);

  if (!nearestNode) {
    return null;
  }

  const destinationNode = findNearestNode(
    {
      x: destination.x,
      y: destination.y,
      floorId: destination.floorId,
    },
    navigationGraph.nodes,
  );

  if (!destinationNode) {
    return null;
  }

  return findPath(navigationGraph, nearestNode.id, destinationNode.id);
}

/**
 * Finds the closest navigation node to a given position.
 */
function findNearestNode(
  position: Pick<Position, "x" | "y" | "floorId">,
  nodes: typeof navigationGraph.nodes,
) {
  let nearestNode: (typeof nodes)[number] | null = null;

  let nearestDistance = Infinity;

  for (const node of nodes) {
    if (node.floorId !== position.floorId) {
      continue;
    }

    const dx = node.x - position.x;
    const dy = node.y - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestNode = node;
    }
  }

  return nearestNode;
}
