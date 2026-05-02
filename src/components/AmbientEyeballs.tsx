import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * 2-3 tiny eyeballs that lazily float around the background behind main content.
 * They are purely decorative — very small, low opacity, and behind z-index 1.
 */

const IRIS_COLORS = ['#FF7A00', '#d66a28', '#c5a13c', '#5c824c', '#4a5c78'];

interface AmbientEye {
  id: number;
  size: number;
  irisColor: string;
  startX: number;
  startY: number;
  opacity: number;
}

function AmbientEye({ eye, gazeX, gazeY }: { eye: AmbientEye; gazeX: number; gazeY: number }) {
  const [target, setTarget] = useState({ x: eye.startX, y: eye.startY });
  const springX = useSpring(eye.startX, { stiffness: 8, damping: 12 });
  const springY = useSpring(eye.startY, { stiffness: 8, damping: 12 });

  useEffect(() => {
    springX.set(target.x);
    springY.set(target.y);
  }, [target, springX, springY]);

  // Drift to a new random position every 8-15 seconds
  useEffect(() => {
    const drift = () => {
      setTarget({
        x: 80 + Math.random() * (window.innerWidth - 160),
        y: 120 + Math.random() * (window.innerHeight - 240),
      });
      setTimeout(drift, 12000 + Math.random() * 10000);
    };
    const t = setTimeout(drift, 5000 + Math.random() * 8000);
    return () => clearTimeout(t);
  }, []);

  // Iris tracking toward gaze
  const dx = gazeX - (target.x / window.innerWidth);
  const dy = gazeY - (target.y / window.innerHeight);
  const angle = Math.atan2(dy, dx);
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 1);
  const maxOff = eye.size * 0.15;
  const irisOffX = Math.cos(angle) * dist * maxOff;
  const irisOffY = Math.sin(angle) * dist * maxOff;

  const irisSize = eye.size * 0.52;
  const pupilSize = eye.size * 0.24;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: eye.size,
        height: eye.size,
        zIndex: 0,
        opacity: 1,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: eye.size,
          height: eye.size,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #f5f0eb, #d8d0c8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Iris */}
        <div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            width: irisSize,
            height: irisSize,
            top: '50%',
            left: '50%',
            marginTop: -irisSize / 2 + irisOffY,
            marginLeft: -irisSize / 2 + irisOffX,
            background: `radial-gradient(circle at 38% 32%, ${eye.irisColor}, #7a2200)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pupil */}
          <div
            style={{
              width: pupilSize,
              height: pupilSize,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #2a180a, #080808)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function AmbientEyeballs({ gazeX, gazeY }: { gazeX: number; gazeY: number }) {
  const eyesRef = useRef<AmbientEye[]>([]);

  if (eyesRef.current.length === 0) {
    const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const H = typeof window !== 'undefined' ? window.innerHeight : 800;
    eyesRef.current = [
      {
        id: 0, size: 28, irisColor: IRIS_COLORS[0],
        startX: W * 0.15, startY: H * 0.35, opacity: 1,
      },
      {
        id: 1, size: 22, irisColor: IRIS_COLORS[3],
        startX: W * 0.82, startY: H * 0.6, opacity: 1,
      },
      {
        id: 2, size: 18, irisColor: IRIS_COLORS[4],
        startX: W * 0.5, startY: H * 0.75, opacity: 1,
      },
    ];
  }

  return (
    <>
      {eyesRef.current.map((eye) => (
        <AmbientEye key={eye.id} eye={eye} gazeX={gazeX} gazeY={gazeY} />
      ))}
    </>
  );
}
