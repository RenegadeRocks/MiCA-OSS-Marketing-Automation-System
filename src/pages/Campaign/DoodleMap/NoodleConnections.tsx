import React, { useMemo } from 'react';
import { NODE_POSITIONS, EDGES, MICA_ORANGE } from './constants';
import type { NodePosition } from './types';

// Build a smooth, single-curve path between two nodes, connecting their centres.
function arcPath(fromId: string, toId: string, nodePositions: Record<string, NodePosition>): { d: string; length: number } {
  const a = nodePositions[fromId];
  const b = nodePositions[toId];
  if (!a || !b) return { d: '', length: 0 };

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const nx = dx / dist;
  const ny = dy / dist;

  // Connect from centre to centre; circles will sit on top so only outer arcs show.
  const x1 = a.x;
  const y1 = a.y;
  const x2 = b.x;
  const y2 = b.y;

  // Perpendicular unit vector for a gentle arc away from the straight line
  const px = -ny;
  const py = nx;

  // Fixed offset so all noodles are clean and predictable, not hand-drawn
  const offset = 40;

  const cp1x = x1 + (x2 - x1) * 0.33 + px * offset;
  const cp1y = y1 + (y2 - y1) * 0.33 + py * offset;
  const cp2x = x1 + (x2 - x1) * 0.66 + px * offset;
  const cp2y = y1 + (y2 - y1) * 0.66 + py * offset;

  const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  const segDist = Math.hypot(x2 - x1, y2 - y1);
  const length = segDist;

  return { d, length };
}

interface NoodleConnectionsProps {
  drawnEdges: Set<string>;
  yesNoAnswers: Record<string, boolean | null>;
  nodePositions?: Record<string, NodePosition>;
}

const NoodleConnections: React.FC<NoodleConnectionsProps> = ({ drawnEdges, yesNoAnswers, nodePositions }) => {
  const positions = nodePositions ?? NODE_POSITIONS;
  const paths = useMemo(() => {
    return EDGES.map((edge) => ({
      ...edge,
      ...arcPath(edge.from, edge.to, positions),
    }));
  }, [positions]);

  return (
    <svg
      style={{
        position: 'absolute',
        overflow: 'visible',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter id="noodleGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((p) => {
        if (!drawnEdges.has(p.id)) return null;

        if (p.condNode != null && p.condValue != null) {
          const answer = yesNoAnswers[p.condNode];
          if (answer !== p.condValue) return null;
        }

        const dashLen = Math.round(p.length);

        return (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={MICA_ORANGE}
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#noodleGlow)"
            opacity="0.9"
            strokeDasharray={dashLen}
            strokeDashoffset={dashLen}
            style={{
              animation: `drawNoodle 0.8s ease-out forwards`,
            }}
          />
        );
      })}
    </svg>
  );
};

export default NoodleConnections;
