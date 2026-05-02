import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, AnimatePresence, useAnimation } from 'framer-motion';
import './OldEyeCharacter.css';

const SMILE_VARIANTS = [
  { d: 'M 8 4 Q 50 36 92 4' },
  { d: 'M 8 12 Q 50 36 92 2' },
  { d: 'M 8 2 Q 50 36 92 12' },
  { d: 'M 2 4 Q 50 44 98 4' },
  { d: 'M 20 8 Q 50 28 80 8' },
];

const MOUTH_PATH = 'M 10 8 Q 50 44 90 8 Q 78 56 50 58 Q 22 56 10 8 Z';
const EXCITEMENT_COOLDOWN_MS = 5500;

// ─────────────────────────────────────────────────────────────────────────────
// All sizing is derived from `size`. The "design baseline" is 240px.
// Changing `size` cascades every measurement correctly.
// ─────────────────────────────────────────────────────────────────────────────
const BASELINE = 240;

function scale(baseline: number, value: number) {
  return (baseline / BASELINE) * value;
}

interface EyeCharacterProps {
  size?: number; // default 108 — change freely without breaking internals
  onGiggle?: () => void;
}

export default function OldEyeCharacter({ size = 108, onGiggle }: EyeCharacterProps) {

  // Derived measurements — all proportional to `size`
  const irisSize = scale(size, 110);
  const pupilSize = scale(size, 54);
  const maxRadius = scale(size, 46);  // max iris travel from center

  // Smile SVG wrapper dimensions
  const smileClosedW = scale(size, 72);
  const smileClosedH = scale(size, 28);
  const smileOpenW = scale(size, 84);
  const smileOpenH = scale(size, 44);
  // Smile unit offset to centre it at the anchor point
  const smileTop = scale(size, -14);
  const smileLeft = scale(size, -36);

  // ── State & refs ────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ── Giggle ──────────────────────────────────────────────────────────────
  const [isGiggling, setIsGiggling] = useState(false);
  const gigglesControls = useAnimation();

  const handleClick = async () => {
    if (isGiggling) return;
    setIsGiggling(true);
    if (onGiggle) onGiggle(); // Trigger the callback (e.g. for showing peeking vignette)

    await gigglesControls.start({
      rotate: [-6, 6, -5, 5, -4, 4, -3, 3, -2, 2, -1, 1, 0],
      y: [2, -4, 2, -4, 2, -3, 1, -3, 1, -2, 0, -1, 0],
      transition: { duration: 0.85, ease: 'easeOut' },
    });
    await gigglesControls.start({
      rotate: 0, y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    });
    setIsGiggling(false);
  };

  // ── Velocity-based excitement ────────────────────────────────────────────
  const [isExcited, setIsExcited] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0, time: Date.now() });
  const calmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownUntil = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMouse.current.time;
      if (dt > 16) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt * 1000;
        if (speed > 250 && now > cooldownUntil.current && !calmTimer.current) {
          setIsExcited(true);
          calmTimer.current = setTimeout(() => {
            setIsExcited(false);
            calmTimer.current = null;
            cooldownUntil.current = Date.now() + EXCITEMENT_COOLDOWN_MS;
          }, 3000);
        }
        lastMouse.current = { x: e.clientX, y: e.clientY, time: now };
      }
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Pupil tracking ───────────────────────────────────────────────────────
  const eyeCenter = useRef({ x: 0, y: 0 });
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      eyeCenter.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  });

  useEffect(() => {
    const dx = mousePosition.x - eyeCenter.current.x;
    const dy = mousePosition.y - eyeCenter.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx);
    const r = Math.min(dist * 0.13, maxRadius);
    setPupilOffset({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  }, [mousePosition, maxRadius]);

  // Springs — values are in screen-pixels (same coordinate space as the DOM)
  const irisX = useSpring(0, { stiffness: 350, damping: 28 });
  const irisY = useSpring(0, { stiffness: 350, damping: 28 });
  const pupilX = useSpring(0, { stiffness: 280, damping: 32 });  // secondary gaze depth
  const pupilY = useSpring(0, { stiffness: 280, damping: 32 });
  const smileX = useSpring(0, { stiffness: 180, damping: 30 });
  const smileY = useSpring(0, { stiffness: 180, damping: 30 });

  useEffect(() => {
    if (isGiggling) return; // freeze during giggle
    irisX.set(pupilOffset.x);
    irisY.set(pupilOffset.y);
    pupilX.set(pupilOffset.x * 0.22);
    pupilY.set(pupilOffset.y * 0.22);
    smileX.set(pupilOffset.x * 0.6);
    smileY.set(pupilOffset.y * 0.6);
  }, [pupilOffset, irisX, irisY, pupilX, pupilY, smileX, smileY, isGiggling]);

  // ── Blink (iris+pupil only, not while giggling) ──────────────────────────
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      setTimeout(blink, Math.random() * 4000 + 2000);
    };
    const t = setTimeout(blink, Math.random() * 4000 + 1500);
    return () => clearTimeout(t);
  }, []);

  // ── Idle smile morphing ──────────────────────────────────────────────────
  const [smileIdx, setSmileIdx] = useState(0);
  useEffect(() => {
    if (isExcited || isGiggling) return;
    const cycle = () => {
      setSmileIdx(p => { let n = Math.floor(Math.random() * SMILE_VARIANTS.length); if (n === p) n = (n + 1) % SMILE_VARIANTS.length; return n; });
      setTimeout(cycle, Math.random() * 4000 + 2500);
    };
    const t = setTimeout(cycle, Math.random() * 3000 + 2000);
    return () => clearTimeout(t);
  }, [isExcited, isGiggling]);

  const smilePath = (isGiggling ? 'M 2 4 Q 50 44 98 4' : SMILE_VARIANTS[smileIdx]?.d) ?? SMILE_VARIANTS[0].d;
  const showMouth = isExcited || isGiggling;

  return (
    <div
      className="eye-container"
      ref={containerRef}
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={gigglesControls}
        onClick={handleClick}
        className="giggle-wrapper"
        style={{ cursor: 'pointer' }}
      >
        {/* ── Sclera ──────────────────────────────────────────────── */}
        <div className="sclera" style={{ width: size, height: size }}>

          {/* ── Iris anchor — % positions so they always stay proportional */}
          <div className="face-anchor">
            <motion.div
              className="iris-unit"
              style={{
                x: irisX, y: irisY,
                top: -irisSize / 2,
                left: -irisSize / 2,
              }}
              animate={{
                scaleY: isGiggling ? 0.08 : (isBlinking ? 0.06 : 1),
                scaleX: isGiggling ? 1.15 : 1,
              }}
              transition={{ duration: isGiggling ? 0.05 : 0.1, ease: 'easeInOut' }}
            >
              <div className="iris" style={{ width: irisSize, height: irisSize }}>
                <motion.div
                  className="pupil"
                  style={{ x: pupilX, y: pupilY, width: pupilSize, height: pupilSize }}
                >
                  {/* Catchlights — positioned proportionally */}
                  <div className="catchlight catchlight-main" style={{
                    width: scale(size, 13),
                    height: scale(size, 13),
                    top: scale(size, 8),
                    left: scale(size, 9),
                  }} />
                  <div className="catchlight catchlight-secondary" style={{
                    width: scale(size, 6),
                    height: scale(size, 6),
                    top: scale(size, 26),
                    left: scale(size, 28),
                  }} />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ── Smile anchor ─────────────────────────────────────── */}
          <div className="smile-anchor">
            <motion.div
              className="smile-unit"
              style={{ x: smileX, y: smileY, top: smileTop, left: smileLeft }}
            >
              <AnimatePresence mode="wait">
                {showMouth ? (
                  <motion.svg
                    key="open"
                    className="smile-svg"
                    width={smileOpenW}
                    height={smileOpenH}
                    viewBox="0 0 100 60"
                    initial={{ scaleY: 0.2, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0.2, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'backOut' }}
                  >
                    <defs>
                      <clipPath id="mouth-clip">
                        <path d={MOUTH_PATH} />
                      </clipPath>
                    </defs>
                    <path d={MOUTH_PATH} fill="#1a0a04" />
                    <ellipse cx="50" cy="56" rx="20" ry="14" fill="#d45b6a" clipPath="url(#mouth-clip)" />
                    <path d="M 10 8 Q 50 44 90 8" fill="none" stroke="#3a2510" strokeWidth="5" strokeLinecap="round" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="closed"
                    className="smile-svg"
                    width={smileClosedW}
                    height={smileClosedH}
                    viewBox="0 0 100 44"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.path
                      d={smilePath}
                      className="smile-path"
                      animate={{ d: smilePath }}
                      transition={{ duration: isGiggling ? 0.15 : 0.7, ease: 'easeInOut' }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
