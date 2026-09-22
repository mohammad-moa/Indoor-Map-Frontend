import type {
  NavigationGraph,
  Route,
} from '@/types/navigation';

interface Point {
  x: number;
  y: number;
}

/**
 * Returns the shortest distance between a point
 * and a line segment.
 */
function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const lengthSquared = dx * dx + dy * dy;

  // Segment is actually a point
  if (lengthSquared === 0) {
    return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);
  }

  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;

  // Keep the closest point inside the segment
  t = Math.max(0, Math.min(1, t));

  const closestX = start.x + t * dx;

  const closestY = start.y + t * dy;

  return Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);
}

/**
 * Calculates the distance from the current position
 * to the remaining part of the route.
 */
export function getRemainingDistance(
  position: Point,
  route: Route,
  graph: NavigationGraph,
): number {
  if (route.nodeIds.length < 2) {
    return 0;
  }

  const routeNodes = route.nodeIds
    .map((id) => graph.nodes.find((node) => node.id === id))
    .filter(
      (node): node is NavigationGraph["nodes"][number] => node !== undefined,
    );

  if (routeNodes.length < 2) {
    return 0;
  }

  let nearestSegmentIndex = 0;
  let nearestDistance = Infinity;
  let closestPoint: Point | null = null;

  // Find the route segment closest to the user
  for (let i = 0; i < routeNodes.length - 1; i++) {
    const start = routeNodes[i];
    const end = routeNodes[i + 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const lengthSquared = dx * dx + dy * dy;

    let t = 0;

    if (lengthSquared !== 0) {
      t =
        ((position.x - start.x) * dx + (position.y - start.y) * dy) /
        lengthSquared;

      t = Math.max(0, Math.min(1, t));
    }

    const point = {
      x: start.x + t * dx,
      y: start.y + t * dy,
    };

    const dxToPoint = position.x - point.x;

    const dyToPoint = position.y - point.y;

    const distance = Math.sqrt(dxToPoint * dxToPoint + dyToPoint * dyToPoint);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSegmentIndex = i;
      closestPoint = point;
    }
  }

  if (!closestPoint) {
    return route.distance;
  }

  // Distance from user to the end of
  // the current route segment
  const currentEnd = routeNodes[nearestSegmentIndex + 1];

  const dx = currentEnd.x - closestPoint.x;

  const dy = currentEnd.y - closestPoint.y;

  let remainingDistance = Math.sqrt(dx * dx + dy * dy);

  // Add all remaining route segments
  for (let i = nearestSegmentIndex + 1; i < routeNodes.length - 1; i++) {
    const current = routeNodes[i];
    const next = routeNodes[i + 1];

    const segmentDx = next.x - current.x;

    const segmentDy = next.y - current.y;

    remainingDistance += Math.sqrt(
      segmentDx * segmentDx + segmentDy * segmentDy,
    );
  }

  return remainingDistance;
}

/**
 * Checks whether the user is close enough
 * to the destination.
 */
export function isArrived(
  position: Point,
  destination: Point,
  threshold = 1,
): boolean {
  const dx = destination.x - position.x;

  const dy = destination.y - position.y;

  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= threshold;
}

/**
 * Checks whether the user has moved
 * too far away from the current route.
 */
export function isOffRoute(
  position: Point,
  route: Route,
  graph: NavigationGraph,
  threshold = 2,
): boolean {
  if (route.nodeIds.length < 2) {
    return false;
  }

  const routeNodes = route.nodeIds
    .map((id) => graph.nodes.find((node) => node.id === id))
    .filter(
      (node): node is NavigationGraph["nodes"][number] => node !== undefined,
    );

  if (routeNodes.length < 2) {
    return false;
  }

  let minimumDistance = Infinity;

  for (let i = 0; i < routeNodes.length - 1; i++) {
    const distance = distanceToSegment(
      position,
      routeNodes[i],
      routeNodes[i + 1],
    );

    minimumDistance = Math.min(minimumDistance, distance);
  }

  return minimumDistance > threshold;
}
