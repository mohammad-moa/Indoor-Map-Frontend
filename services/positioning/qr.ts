import { qrLocations } from '@/data';
import type { Position } from '@/types';
import type { QRPayload } from '@/types/qr';

export function getPositionFromQR(payload: QRPayload): Position | null {
  const location = qrLocations.find(
    (item) => item.sourceId === payload.sourceId,
  );

  console.log(qrLocations);

  if (!location) {
    return null;
  }

  return {
    x: location.x,
    y: location.y,
    floorId: location.floorId,
    source: "qr",
    accuracy: 0,
    timestamp: Date.now(),
  };
}
