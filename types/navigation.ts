export interface NavigationNode {
  id: string;

  /**
   * Position in map coordinates (meters).
   */
  x: number;
  y: number;

  floorId: string;
}

export interface NavigationEdge {
  from: string;
  to: string;

  /**
   * Distance between the two nodes in meters.
   */
  distance: number;
}

export interface NavigationGraph {
  nodes: NavigationNode[];
  edges: NavigationEdge[];
}

export interface Route {
  nodeIds: string[];

  /**
   * Total route distance in meters.
   */
  distance: number;
}
