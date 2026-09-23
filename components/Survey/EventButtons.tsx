"use client";

import type { SurveyEventType } from '@/types';

interface EventButtonsProps {
  onEvent: (type: SurveyEventType) => void;
}

const buttons: {
  type: SurveyEventType;
  label: string;
}[] = [
  { type: "door", label: "🚪 Door" },
  { type: "intersection", label: "🔀 Intersection" },
  { type: "turn", label: "↪️ Turn" },
  { type: "stairs", label: "🪜 Stairs" },
  { type: "elevator", label: "🛗 Elevator" },
  { type: "landmark", label: "📍 Landmark" },
  { type: "obstacle", label: "⚠️ Obstacle" },
  { type: "room", label: "🚪 Room" },
  { type: "finish", label: "🏁 Finish" },
];

export const EventButtons = ({ onEvent }: EventButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {buttons.map((button) => (
        <button
          key={button.type}
          type="button"
          onClick={() => onEvent(button.type)}
          className="rounded-lg border px-3 py-3 text-sm font-medium hover:bg-gray-100"
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};
