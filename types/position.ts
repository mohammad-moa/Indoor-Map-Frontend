export type PositionSource = "mock" | "qr" | "beacon" | "pdr" | "fusion";

export interface Position {
  x: number;
  y: number;
  floorId: string;

  /**
   * Estimated horizontal accuracy in meters.
   */
  accuracy?: number;

  source: PositionSource;

  timestamp: number;
}
