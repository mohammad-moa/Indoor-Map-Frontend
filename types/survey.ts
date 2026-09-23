export type SurveyEventType =
  | "door"
  | "intersection"
  | "turn"
  | "stairs"
  | "elevator"
  | "landmark"
  | "obstacle"
  | "room"
  | "finish";

export interface SensorSample {
  timestamp: number;

  accelerometer?: {
    x: number;
    y: number;
    z: number;
  };

  gyroscope?: {
    x: number;
    y: number;
    z: number;
  };

  magnetometer?: {
    x: number;
    y: number;
    z: number;
  };

  heading?: number;
}

export interface SurveyPosition {
  x: number;
  y: number;
  floorId: string;
}

export interface SurveyEvent {
  id: string;
  type: SurveyEventType;
  timestamp: number;

  /**
   * Position estimated by PDR
   * at the moment the event was created.
   */
  estimatedPosition: SurveyPosition;

  /**
   * Actual position selected manually
   * on the map.
   */
  groundTruthPosition?: SurveyPosition;

  note?: string;
}

export interface SurveySession {
  id: string;

  startedAt: number;
  finishedAt?: number;

  floorId: string;

  events: SurveyEvent[];

  sensorSamples: SensorSample[];
}
