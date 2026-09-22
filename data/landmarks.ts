import type { Landmark } from '@/types';

export const landmarks: Landmark[] = [
  {
    id: "entrance",
    name: "ورودی",
    type: "entrance",
    floorId: "floor-1",
    x: 2,
    y: 2,
  },
  {
    id: "reception",
    name: "پذیرش",
    type: "reception",
    floorId: "floor-1",
    x: 6,
    y: 2,
  },
  {
    id: "room-101",
    name: "اتاق 101",
    type: "room",
    floorId: "floor-1",
    x: 12,
    y: 3,
  },
  {
    id: "room-102",
    name: "اتاق 102",
    type: "room",
    floorId: "floor-1",
    x: 16,
    y: 3,
  },
  {
    id: "restroom",
    name: "سرویس بهداشتی",
    type: "restroom",
    floorId: "floor-1",
    x: 16,
    y: 9,
  },
];
