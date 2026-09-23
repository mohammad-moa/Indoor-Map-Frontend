import type {
  NavigationGraph,
  NavigationNode,
  Route,
} from '@/types/navigation';

export type NavigationInstructionType =
  | "straight"
  | "left"
  | "right"
  | "arrive";

export interface NavigationInstruction {
  type: NavigationInstructionType;
  distance: number;
  nodeId: string;
}

function getDistance(from: NavigationNode, to: NavigationNode): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function getAngle(from: NavigationNode, to: NavigationNode): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return Math.atan2(dx, -dy) * (180 / Math.PI);
}

function normalizeAngle(angle: number): number {
  let normalized = angle;

  while (normalized > 180) {
    normalized -= 360;
  }

  while (normalized < -180) {
    normalized += 360;
  }

  return normalized;
}

function getTurnDirection(
  previous: NavigationNode,
  current: NavigationNode,
  next: NavigationNode,
): "straight" | "left" | "right" {
  const incomingAngle = getAngle(previous, current);

  const outgoingAngle = getAngle(current, next);

  const turnAngle = normalizeAngle(outgoingAngle - incomingAngle);

  const STRAIGHT_THRESHOLD = 30;

  if (Math.abs(turnAngle) <= STRAIGHT_THRESHOLD) {
    return "straight";
  }

  return turnAngle > 0 ? "right" : "left";
}

function getNode(
  graph: NavigationGraph,
  nodeId: string,
): NavigationNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function buildNavigationInstructions(
  route: Route,
  graph: NavigationGraph,
): NavigationInstruction[] {
  const routeNodes = route.nodeIds
    .map((nodeId) => getNode(graph, nodeId))
    .filter((node): node is NavigationNode => node !== undefined);

  if (routeNodes.length === 0) {
    return [];
  }

  if (routeNodes.length === 1) {
    return [
      {
        type: "arrive",
        distance: 0,
        nodeId: routeNodes[0].id,
      },
    ];
  }

  const instructions: NavigationInstruction[] = [];

  let distanceSinceLastInstruction = 0;

  for (let i = 0; i < routeNodes.length - 1; i++) {
    const current = routeNodes[i];
    const next = routeNodes[i + 1];

    distanceSinceLastInstruction += getDistance(current, next);

    /*
     * We need three nodes to determine
     * whether there is a turn.
     */
    if (i < 1) {
      continue;
    }

    const previous = routeNodes[i - 1];

    const direction = getTurnDirection(previous, current, next);

    if (direction === "straight") {
      continue;
    }

    instructions.push({
      type: direction,
      distance: distanceSinceLastInstruction,
      nodeId: current.id,
    });

    distanceSinceLastInstruction = 0;
  }

  /*
   * Add the final instruction.
   */
  const lastNode = routeNodes[routeNodes.length - 1];

  instructions.push({
    type: "arrive",
    distance: distanceSinceLastInstruction,
    nodeId: lastNode.id,
  });

  return instructions;
}
