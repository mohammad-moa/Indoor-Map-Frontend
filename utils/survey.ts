import type {
  SurveyEvent,
  SurveyPosition,
} from '@/types/survey';

export function getPositionError(
  estimated: SurveyPosition,
  groundTruth: SurveyPosition,
): number {
  return Math.hypot(estimated.x - groundTruth.x, estimated.y - groundTruth.y);
}

export function getSurveyErrors(events: SurveyEvent[]): number[] {
  return events
    .filter((event) => event.groundTruthPosition !== undefined)
    .map((event) =>
      getPositionError(event.estimatedPosition, event.groundTruthPosition!),
    );
}

export function getAverageError(errors: number[]): number | null {
  if (errors.length === 0) {
    return null;
  }

  return errors.reduce((sum, error) => sum + error, 0) / errors.length;
}

export function getMaxError(errors: number[]): number | null {
  if (errors.length === 0) {
    return null;
  }

  return Math.max(...errors);
}

export function getMinError(errors: number[]): number | null {
  if (errors.length === 0) {
    return null;
  }

  return Math.min(...errors);
}

export function getPercentile(
  values: number[],
  percentile: number,
): number | null {
  if (values.length === 0) {
    return null;
  }

  if (percentile < 0 || percentile > 100) {
    throw new Error("Percentile must be between 0 and 100.");
  }

  const sorted = [...values].sort((a, b) => a - b);

  const index = (percentile / 100) * (sorted.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function getP90Error(errors: number[]): number | null {
  return getPercentile(errors, 90);
}
