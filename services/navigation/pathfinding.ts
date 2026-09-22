import type {
  NavigationEdge,
  NavigationGraph,
  NavigationNode,
} from '@/types';

interface OpenNode {
  nodeId: string;
  fScore: number;
}

/**
 * Finds the shortest path between two nodes using the A* algorithm.
 */
export function findPath(
  graph: NavigationGraph,
  startNodeId: string,
  destinationNodeId: string,
) {
  const nodes = new Map<string, NavigationNode>(
    graph.nodes.map((node) => [node.id, node]),
  );

  const neighbors = buildNeighborMap(graph.edges);

  const openSet: OpenNode[] = [
    {
      nodeId: startNodeId,
      fScore: 0,
    },
  ];

  const cameFrom = new Map<string, string>();

  const gScore = new Map<string, number>();

  for (const node of graph.nodes) {
    gScore.set(node.id, Infinity);
  }

  gScore.set(startNodeId, 0);

  const fScore = new Map<string, number>();

  for (const node of graph.nodes) {
    fScore.set(node.id, Infinity);
  }

  fScore.set(startNodeId, heuristic(nodes, startNodeId, destinationNodeId));

  const closedSet = new Set<string>();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fScore - b.fScore);

    const current = openSet.shift();

    if (!current) {
      break;
    }

    const currentNodeId = current.nodeId;

    if (currentNodeId === destinationNodeId) {
      return reconstructPath(
        cameFrom,
        currentNodeId,
        gScore.get(currentNodeId) ?? 0,
      );
    }

    if (closedSet.has(currentNodeId)) {
      continue;
    }

    closedSet.add(currentNodeId);

    const currentNeighbors = neighbors.get(currentNodeId) ?? [];

    for (const edge of currentNeighbors) {
      if (closedSet.has(edge.to)) {
        continue;
      }

      const currentGScore = gScore.get(currentNodeId) ?? Infinity;

      const tentativeGScore = currentGScore + edge.distance;

      const neighborGScore = gScore.get(edge.to) ?? Infinity;

      if (tentativeGScore < neighborGScore) {
        cameFrom.set(edge.to, currentNodeId);

        gScore.set(edge.to, tentativeGScore);

        const estimatedTotalCost =
          tentativeGScore + heuristic(nodes, edge.to, destinationNodeId);

        fScore.set(edge.to, estimatedTotalCost);

        openSet.push({
          nodeId: edge.to,
          fScore: estimatedTotalCost,
        });
      }
    }
  }

  return null;
}

/**
 * Creates an adjacency list from the graph edges.
 *
 * Edges are treated as bidirectional.
 */
function buildNeighborMap(
  edges: NavigationEdge[],
): Map<string, NavigationEdge[]> {
  const neighbors = new Map<string, NavigationEdge[]>();

  for (const edge of edges) {
    if (!neighbors.has(edge.from)) {
      neighbors.set(edge.from, []);
    }

    if (!neighbors.has(edge.to)) {
      neighbors.set(edge.to, []);
    }

    neighbors.get(edge.from)!.push(edge);

    neighbors.get(edge.to)!.push({
      ...edge,
      from: edge.to,
      to: edge.from,
    });
  }

  return neighbors;
}

/**
 * Euclidean distance between two nodes.
 *
 * Used as the heuristic function for A*.
 */
function heuristic(
  nodes: Map<string, NavigationNode>,
  fromId: string,
  toId: string,
): number {
  const from = nodes.get(fromId);
  const to = nodes.get(toId);

  if (!from || !to) {
    return Infinity;
  }

  const dx = from.x - to.x;
  const dy = from.y - to.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Reconstructs the final route from the cameFrom map.
 */
function reconstructPath(
  cameFrom: Map<string, string>,
  currentNodeId: string,
  distance: number,
) {
  const nodeIds = [currentNodeId];

  let current = currentNodeId;

  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    nodeIds.unshift(current);
  }

  return {
    nodeIds,
    distance,
  };
}
