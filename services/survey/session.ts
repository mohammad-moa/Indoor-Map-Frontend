import type { SurveySession } from '@/types';

export function createSurveySession(floorId: string): SurveySession {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    floorId,
    events: [],
    sensorSamples: [],
  };
}
