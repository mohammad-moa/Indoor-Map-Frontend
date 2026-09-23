import type {
  NavigationGraph,
  NavigationNode,
  Route,
} from '@/types/navigation';

export interface Point {
  x: number;
  y: number;
}

export interface ClosestRouteSegment {
  segmentIndex: number;
  distance: number;
}

/**
 * Returns the shortest distance between a point
 * and a line segment.
 */
export function distanceToSegment(
  point: Point,
  start: Point,
  end: Point,
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Segment is actually a single point.
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const lengthSquared = dx * dx + dy * dy;

  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;

  // Keep the projected point inside the segment.
  t = Math.max(0, Math.min(1, t));

  const closestX = start.x + t * dx;
  const closestY = start.y + t * dy;

  return Math.hypot(point.x - closestX, point.y - closestY);
}

/**
 * Returns all valid nodes of a route.
 */
function getRouteNodes(route: Route, graph: NavigationGraph): NavigationNode[] {
  return route.nodeIds
    .map((id) => graph.nodes.find((node) => node.id === id))
    .filter((node): node is NavigationNode => node !== undefined);
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
  const routeNodes = getRouteNodes(route, graph);

  if (routeNodes.length < 2) {
    return false;
  }

  let minimumDistance = Infinity;

  for (let i = 0; i < routeNodes.length - 1; i++) {
    const start = routeNodes[i];
    const end = routeNodes[i + 1];

    // Ignore segments from another floor.
    if (
      "floorId" in position &&
      (start.floorId !== position.floorId || end.floorId !== position.floorId)
    ) {
      continue;
    }

    const distance = distanceToSegment(position, start, end);

    minimumDistance = Math.min(minimumDistance, distance);
  }

  return minimumDistance > threshold;
}

/**
 * Finds the route segment that is closest
 * to the user's current position.
 */
export function getClosestRouteSegment(
  position: Point,
  route: Route,
  graph: NavigationGraph,
): ClosestRouteSegment | null {
  const routeNodes = getRouteNodes(route, graph);

  if (routeNodes.length < 2) {
    return null;
  }

  let closestSegment: ClosestRouteSegment | null = null;

  for (let i = 0; i < routeNodes.length - 1; i++) {
    const start = routeNodes[i];
    const end = routeNodes[i + 1];

    // If position contains floorId, ignore
    // segments from other floors.
    if (
      "floorId" in position &&
      (start.floorId !== position.floorId || end.floorId !== position.floorId)
    ) {
      continue;
    }

    const distance = distanceToSegment(position, start, end);

    if (closestSegment === null || distance < closestSegment.distance) {
      closestSegment = {
        segmentIndex: i,
        distance,
      };
    }
  }

  return closestSegment;
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
  const routeNodes = getRouteNodes(route, graph);

  if (routeNodes.length < 2) {
    return 0;
  }

  let nearestSegmentIndex = 0;
  let nearestDistance = Infinity;
  let closestPoint: Point | null = null;

  for (let i = 0; i < routeNodes.length - 1; i++) {
    const start = routeNodes[i];
    const end = routeNodes[i + 1];

    // Ignore segments from another floor.
    if (
      "floorId" in position &&
      (start.floorId !== position.floorId || end.floorId !== position.floorId)
    ) {
      continue;
    }

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

    const distance = Math.hypot(position.x - point.x, position.y - point.y);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSegmentIndex = i;
      closestPoint = point;
    }
  }

  if (!closestPoint) {
    return route.distance;
  }

  /*
   * Distance from the closest point on the current
   * segment to the end of that segment.
   */
  const currentEnd = routeNodes[nearestSegmentIndex + 1];

  let remainingDistance = Math.hypot(
    currentEnd.x - closestPoint.x,
    currentEnd.y - closestPoint.y,
  );

  /*
   * Add all remaining route segments.
   */
  for (let i = nearestSegmentIndex + 1; i < routeNodes.length - 1; i++) {
    const current = routeNodes[i];
    const next = routeNodes[i + 1];

    remainingDistance += Math.hypot(next.x - current.x, next.y - current.y);
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
  const distance = Math.hypot(
    destination.x - position.x,
    destination.y - position.y,
  );

  return distance <= threshold;
}
