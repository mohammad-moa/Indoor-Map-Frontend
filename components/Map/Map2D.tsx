"use client";

import type { Landmark } from '@/types/map';
import type {
  NavigationGraph,
  Route,
} from '@/types/navigation';
import type { Position } from '@/types/position';

interface Map2DProps {
  width: number;
  height: number;
  graph: NavigationGraph;
  landmarks: Landmark[];
  route?: Route | null;
  position?: Position | null;
}

const SVG_WIDTH = 800;
const SVG_HEIGHT = 480;

export const Map2D = ({
  width,
  height,
  graph,
  landmarks,
  route,
  position,
}: Map2DProps) => {
  const scaleX = SVG_WIDTH / width;
  const scaleY = SVG_HEIGHT / height;

  const toSvg = (x: number, y: number) => ({
    x: x * scaleX,
    y: SVG_HEIGHT - y * scaleY,
  });

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  const routePoints =
    route?.nodeIds
      .map((nodeId) => nodeMap.get(nodeId))
      .filter(Boolean)
      .map((node) => {
        const point = toSvg(node!.x, node!.y);

        return `${point.x},${point.y}`;
      })
      .join(" ") ?? "";

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-white shadow-sm">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="h-auto w-full">
        {/* Map background */}
        <rect
          x="0"
          y="0"
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          fill="#f8fafc"
        />

        {/* Navigation edges */}
        {graph.edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);

          if (!from || !to) {
            return null;
          }

          const start = toSvg(from.x, from.y);
          const end = toSvg(to.x, to.y);

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#cbd5e1"
              strokeWidth="8"
              strokeLinecap="round"
            />
          );
        })}

        {/* Calculated route */}
        {routePoints && (
          <polyline
            points={routePoints}
            fill="none"
            stroke="#16a34a"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Navigation nodes */}
        {graph.nodes.map((node) => {
          const point = toSvg(node.x, node.y);

          return (
            <circle
              key={node.id}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#64748b"
            />
          );
        })}

        {/* Landmarks */}
        {landmarks.map((landmark) => {
          const point = toSvg(landmark.x, landmark.y);

          return (
            <g key={landmark.id}>
              <circle cx={point.x} cy={point.y} r="12" fill="#2563eb" />

              <text
                x={point.x}
                y={point.y - 18}
                textAnchor="middle"
                fontSize="14"
                fill="#0f172a"
              >
                {landmark.name}
              </text>
            </g>
          );
        })}

        {/* User position */}
        {position &&
          (() => {
            const point = toSvg(position.x, position.y);

            return (
              <g>
                <circle cx={point.x} cy={point.y} r="14" fill="#dc2626" />

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="22"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="3"
                  opacity="0.3"
                />
              </g>
            );
          })()}
      </svg>
    </div>
  );
};
