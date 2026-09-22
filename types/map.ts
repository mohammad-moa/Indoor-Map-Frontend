export interface Floor {
  id: string;
  name: string;

  /**
   * Map dimensions in meters.
   */
  width: number;
  height: number;
}

export type LandmarkType =
  | "room"
  | "corridor"
  | "entrance"
  | "stairs"
  | "elevator"
  | "restroom"
  | "reception"
  | "other";

export interface Landmark {
  id: string;
  name: string;
  type: LandmarkType;

  floorId: string;

  /**
   * Position in map coordinates (meters).
   */
  x: number;
  y: number;
}
