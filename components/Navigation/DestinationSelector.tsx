"use client";

import type { Landmark } from '@/types';

interface DestinationSelectorProps {
  landmarks: Landmark[];
  selectedDestinationId: string | null;
  onSelect: (destinationId: string) => void;
}

export const DestinationSelector = ({
  landmarks,
  selectedDestinationId,
  onSelect,
}: DestinationSelectorProps) => {
  const destinations = landmarks.filter(
    (landmark) =>
      landmark.type === "room" ||
      landmark.type === "restroom" ||
      landmark.type === "reception",
  );

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <label htmlFor="destination" className="mb-2 block text-sm font-medium">
        مقصد
      </label>

      <select
        id="destination"
        value={selectedDestinationId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      >
        <option value="" disabled>
          انتخاب مقصد
        </option>

        {destinations.map((destination) => (
          <option key={destination.id} value={destination.id}>
            {destination.name}
          </option>
        ))}
      </select>
    </div>
  );
};
