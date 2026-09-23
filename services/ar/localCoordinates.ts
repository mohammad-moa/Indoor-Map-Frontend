import type { Position } from '@/types/position';

export interface ARLocalPosition {
  x: number;
  z: number;
}

/**
 * Converts map coordinates into a local AR coordinate system.
 *
 * The QR position becomes the AR origin.
 *
 * Map:
 *   x -> AR x
 *   y -> AR z
 *
 * AR Y is intentionally not used here because
 * floor height is handled by WebXR.
 */
export function mapToARLocal(
  position: Position,
  origin: Position,
  scale = 1,
): ARLocalPosition {
  return {
    x: (position.x - origin.x) * scale,

    z: -(position.y - origin.y) * scale,
  };
}
