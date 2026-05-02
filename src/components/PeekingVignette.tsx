import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PeekingVignette.css';

// Iris color palette — primary oranges mixed with desaturated yellows, greens, and blues
const IRIS_COLORS = [
  '#FF7A00', '#E85200', '#FA5F00', // core oranges
  '#d66a28', '#c97842',           // desaturated earthy oranges
  '#c5a13c', '#d5af4a',           // desaturated mustard yellows
  '#5c824c', '#719c5c',           // desaturated forest greens
  '#4a5c78', '#5b6b85', '#606c78' // desaturated slate blues
];

interface EyeData {
  x: number; y: number;
  startX: number; startY: number;
  size: number; delay: number;
  irisColor: string;
}

function PeekingEye({ x, y, startX, startY, size, delay, irisColor, gazeX, gazeY }:
  EyeData & { gazeX: number; gazeY: number }) {

  // Iris offset toward gaze target (no springs — shared, computed once)
  const cx = x / window.innerWidth;
  const cy = y / window.innerHeight;
  const dx = (gazeX - cx) * 2;
  const dy = (gazeY - cy) * 2;
  const maxOff = size * 0.17;
  const angle = Math.atan2(dy, dx);
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 1);
  const irisOffX = Math.cos(angle) * dist * maxOff;
  const irisOffY = Math.sin(angle) * dist * maxOff;

  const irisSize = size * 0.54;
  const pupilSize = size * 0.26;
  const offX = startX - x;
  const offY = startY - y;

  return (
    <motion.div
      className="peeking-eye"
      style={{ position: 'fixed', left: x - size / 2, top: y - size / 2, width: size, height: size }}
      initial={{ x: offX, y: offY }}
      animate={{ x: 0, y: 0 }}
      exit={{
        x: offX, y: offY,
        transition: { duration: 0.4, ease: 'easeIn', delay: delay / 2000 }
      }}
      transition={{ delay: delay / 1000, duration: 0.6, ease: 'backOut' }}
    >
      <div className="peeking-sclera">
        {/* Iris - Adjusted to be slightly transparent to blend with the glassmorphism theme */}
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: irisSize, height: irisSize,
          top: '50%', left: '50%',
          marginTop: -irisSize / 2 + irisOffY,
          marginLeft: -irisSize / 2 + irisOffX,
          backgroundColor: irisColor,
          opacity: 0.85,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        }}>
          {/* Pupil - Dark grey/black, slightly soft */}
          <div style={{
            width: pupilSize, height: pupilSize, borderRadius: '50%',
            backgroundColor: 'rgba(20, 20, 20, 0.9)',
          }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Stratified Grid Distribution ────────────────────────────────────────────
// By dividing the screen into a grid and populating cells based on a probability 
// heatmap, we ensure an even spread (no dense clumps, no giant gaps) while 
// randomized jitter inside the cell keeps it feeling organic.
function generateVignette(maxPeekDepth: number): EyeData[] {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const eyes: EyeData[] = [];

  const cellSize = 30; // smaller grid = more potential eyeballs filling gaps
  const cols = Math.ceil(W / cellSize);
  const rows = Math.ceil(H / cellSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellX = c * cellSize + cellSize / 2;
      const cellY = r * cellSize + cellSize / 2;

      const distBottom = H - cellY;
      const distLeft = cellX;
      const distRight = W - cellX;
      const distSide = Math.min(distLeft, distRight);

      let prob = 0;
      let startX = cellX;
      let startY = cellY;
      let delayBase = 0;

      // GEOMETRIC SHAPING
      // 1. Bottom U-Shape: Depth reaching inward is shallow at center, deep at corners.
      const distFromCenterNormX = Math.abs(cellX - W / 2) / (W / 2); // 0 at center, 1 at side edges
      const bottomPeekDepth = maxPeekDepth * (0.15 + 0.85 * Math.pow(distFromCenterNormX, 1.5));

      // 2. Side Taper: Depth reaching inward is deep at bottom, very shallow at top.
      const distFromTopNormY = cellY / H; // 0 at top, 1 at bottom
      const sidePeekDepth = maxPeekDepth * (0.10 + 0.90 * Math.pow(distFromTopNormY, 1.8));

      if (distBottom < bottomPeekDepth) {
        // Bottom band - bounds itself create the U-shape physical layout
        prob = 0.40 * (1 - (distBottom / bottomPeekDepth) * 0.4); // High density near edge, tapers inward
        startY = H + Math.random() * 50 + 40; // Enter from bottom
        delayBase = 0;
      } else if (distSide < sidePeekDepth) {
        // Side bands - bounds themselves taper cleanly towards the top
        prob = 0.35 * (1 - (distSide / sidePeekDepth) * 0.5);
        startX = distLeft < distRight ? -(Math.random() * 50 + 40) : W + Math.random() * 50 + 40; // Enter from side
        delayBase = 150 + Math.random() * 200 + (1 - distFromTopNormY) * 300;
      } else if (cellY < maxPeekDepth * 0.25) {
        // Sparse top edge - extremely thin margin here
        prob = 0.08 * (1 - cellY / (maxPeekDepth * 0.25));
        startY = -(Math.random() * 50 + 40); // Enter from top
        delayBase = 400 + Math.random() * 200;
      }

      if (Math.random() < prob) {
        const size = 18 + Math.random() * 24; // 18-42px

        // Jitter cell center to feel organic
        let x = cellX + (Math.random() - 0.5) * (cellSize * 0.85);
        let y = cellY + (Math.random() - 0.5) * (cellSize * 0.85);

        // Ensure start coordinates align with edge entry mechanics
        if (distBottom < bottomPeekDepth) startX = x;
        if (distSide < sidePeekDepth && distBottom >= bottomPeekDepth) startY = y;
        if (cellY < maxPeekDepth * 0.25) startX = x;

        eyes.push({
          x, y, startX, startY, size,
          delay: delayBase + Math.random() * 300,
          irisColor: IRIS_COLORS[Math.floor(Math.random() * IRIS_COLORS.length)],
        });
      }
    }
  }
  return eyes;
}

interface Props {
  visible: boolean;
  gazeX: number;
  gazeY: number;
  version?: 'modern' | 'classic';
}

export default function PeekingVignette({ visible, gazeX, gazeY }: Props) {
  const [eyes, setEyes] = useState<EyeData[]>([]);

  useEffect(() => {
    if (visible) {
      setEyes(prev => prev.length > 0 ? prev : generateVignette(140));
    } else {
      setEyes([]);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {eyes.map((eye: EyeData, i: number) => (
        <PeekingEye key={i} {...eye} gazeX={gazeX} gazeY={gazeY} />
      ))}
    </AnimatePresence>
  );
}
