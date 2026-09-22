import type {
  NavigationEdge,
  NavigationGraph,
  NavigationNode,
} from '@/types';

const nodes: NavigationNode[] = [
  {
    id: "node-entrance",
    x: 2,
    y: 2,
    floorId: "floor-1",
  },
  {
    id: "node-reception",
    x: 6,
    y: 2,
    floorId: "floor-1",
  },
  {
    id: "node-b",
    x: 9,
    y: 2,
    floorId: "floor-1",
  },
  {
    id: "node-c",
    x: 12,
    y: 2,
    floorId: "floor-1",
  },
  {
    id: "node-room-101",
    x: 12,
    y: 3,
    floorId: "floor-1",
  },
  {
    id: "node-d",
    x: 9,
    y: 6,
    floorId: "floor-1",
  },
  {
    id: "node-e",
    x: 16,
    y: 6,
    floorId: "floor-1",
  },
  {
    id: "node-room-102",
    x: 16,
    y: 3,
    floorId: "floor-1",
  },
  {
    id: "node-f",
    x: 12,
    y: 9,
    floorId: "floor-1",
  },
  {
    id: "node-restroom",
    x: 16,
    y: 9,
    floorId: "floor-1",
  },
];

const edges: NavigationEdge[] = [
  {
    from: "node-entrance",
    to: "node-reception",
    distance: 4,
  },
  {
    from: "node-reception",
    to: "node-b",
    distance: 3,
  },
  {
    from: "node-b",
    to: "node-c",
    distance: 3,
  },
  {
    from: "node-c",
    to: "node-room-101",
    distance: 1,
  },
  {
    from: "node-b",
    to: "node-d",
    distance: 4,
  },
  {
    from: "node-d",
    to: "node-e",
    distance: 7,
  },
  {
    from: "node-e",
    to: "node-room-102",
    distance: 3,
  },
  {
    from: "node-d",
    to: "node-f",
    distance: 3,
  },
  {
    from: "node-f",
    to: "node-restroom",
    distance: 4,
  },
];

export const navigationGraph: NavigationGraph = {
  nodes,
  edges,
};
