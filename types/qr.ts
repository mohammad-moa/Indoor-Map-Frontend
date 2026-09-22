export interface QRLocation {
  sourceId: string;
  name: string;
  floorId: string;
  x: number;
  y: number;
}

export interface QRPayload {
  sourceId: string;
  destinationId: string;
}
