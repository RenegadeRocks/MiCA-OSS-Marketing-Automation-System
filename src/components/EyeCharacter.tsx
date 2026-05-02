import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, AnimatePresence, useAnimation } from 'framer-motion';
import { useAnimationContext } from '../context/AnimationContext';
import './EyeCharacter.css';

const SMILE_VARIANTS = [
  { d: 'M 8 4 Q 50 36 92 4' },
  { d: 'M 8 12 Q 50 36 92 2' },
  { d: 'M 8 2 Q 50 36 92 12' },
  { d: 'M 2 4 Q 50 44 98 4' },
  { d: 'M 20 8 Q 50 28 80 8' },
];

const MOUTH_PATH = 'M 10 8 Q 50 44 90 8 Q 78 56 50 58 Q 22 56 10 8 Z';
const EXCITEMENT_COOLDOWN_MS = 5500;

// Rocket SVG path
const ROCKET_PATH = "M 44.75 3 C 44.75 3 20 25.25 20 54.5 C 20 61.5 22.5 67.5 26.5 73.5 L 12 90 C 12 90 27.5 86 36 84 C 41.5 88 48 90 55.5 90 C 63 90 69.5 88 75 84 C 83.5 86 99 90 99 90 L 84.5 73.5 C 88.5 67.5 91 61.5 91 54.5 C 91 25.25 66.25 3 66.25 3 L 44.75 3 Z M 55.5 25 C 63.5 25 70 31.5 70 39.5 C 70 47.5 63.5 54 55.5 54 C 47.5 54 41 47.5 41 39.5 C 41 31.5 47.5 25 55.5 25 Z";

// ─────────────────────────────────────────────────────────────────────────────
// All sizing is derived from `size`. The "design baseline" is 240px.
// Changing `size` cascades every measurement correctly.
// ─────────────────────────────────────────────────────────────────────────────
const BASELINE = 240;

const GIGGLE_KEYFRAMES = {
  rotate: [-6, 6, -5, 5, -4, 4, -3, 3, -2, 2, -1, 1, 0],
  y: [2, -4, 2, -4, 2, -3, 1, -3, 1, -2, 0, -1, 0],
} as const;

function scale(baseline: number, value: number) {
  return (baseline / BASELINE) * value;
}

interface EyeCharacterProps {
  size?: number; // default 108 — change freely without breaking internals
  onGiggle?: () => void;
  version?: 'modern' | 'classic';
}

export default function EyeCharacter({ size = 108, onGiggle, version = 'modern' }: EyeCharacterProps) {

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
  const { mode, generationProgress, gazeTarget } = useAnimationContext();

  // ── Giggle & Lock ────────────────────────────────────────────────────────
  const [isGiggling, setIsGiggling] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const gigglesControls = useAnimation();

  const handleClick = async () => {
    if (isGiggling) return;
    setIsGiggling(true);
    if (onGiggle) onGiggle(); // Trigger the callback (e.g. for showing peeking vignette)

    await gigglesControls.start({
      rotate: [...GIGGLE_KEYFRAMES.rotate],
      y: [...GIGGLE_KEYFRAMES.y],
      transition: { duration: 0.85, ease: 'easeOut' },
    });
    await gigglesControls.start({
      rotate: 0, y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    });
    setIsGiggling(false);
  };

  const hasGiggledForGeneration = useRef(false);

  useEffect(() => {
    if (mode === 'generating') {
      if (generationProgress >= 1 && !hasGiggledForGeneration.current) {
        hasGiggledForGeneration.current = true;
        // Trigger giggle automatically
        handleClick();
      } else if (generationProgress < 1) {
        hasGiggledForGeneration.current = false;
      }
    }
  }, [generationProgress, mode]);

  // ── Error Dizzy Sequence ────────────────────────────────────────────────
  const errorControls = useAnimation();
  useEffect(() => {
    if (mode === 'error') {
      const playDizzy = async () => {
        setIsLocked(true); // lock out other states
        // Shake sequence
        await errorControls.start({
          x: [-15, 15, -12, 12, -8, 8, -4, 4, 0],
          y: [-5, 5, -4, 4, -2, 2, 0],
          rotate: [-10, 10, -8, 8, -5, 5, 0],
          transition: { duration: 1.2, ease: "easeInOut" }
        });
        
        // Let it linger slightly before releasing lock (if mode stays error, pupil stays spiral)
        setTimeout(() => setIsLocked(false), 500);
      };
      playDizzy();
    }
  }, [mode, errorControls]);

  // ── Rocket Launch Sequence ────────────────────────────────────────────────
  const rocketControls = useAnimation();
  const eyeballControls = useAnimation();
  const [showRocket, setShowRocket] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  useEffect(() => {
    if (mode === 'launching') {
      const playLaunch = async () => {
        setIsLocked(true); // lock out mouse tracking 
        setShowRocket(true);
        if (onGiggle) onGiggle(); // Summon peeking eyeballs to watch the launch!

        // 1. Rocket flies in from left to center
        await new Promise(r => setTimeout(r, 50)); // wait for mount so initial doesn't override start
        
        await rocketControls.start({
          x: [-1500, 0],
          y: 0,
          rotate: [45, 0],
          scale: [0.5, 1.2],
          opacity: [0, 1],
          transition: { duration: 1.5, type: 'spring', bounce: 0.2 }
        });

        // 2. Eyeball jumps onto rocket
        await eyeballControls.start({
          y: [0, -50, -10],
          scale: 0.8,
          transition: { duration: 0.4, times: [0, 0.5, 1], ease: "easeInOut" }
        });

        await new Promise(r => setTimeout(r, 200));

        // 3. Blast off!
        setShowParticles(true);
        setIsFlying(true);
        const blastOffTransition = { duration: 1.2, ease: "easeIn" as const };
        
        rocketControls.start({
          y: -1200,
          transition: blastOffTransition
        });
        
        await eyeballControls.start({
          y: -1220,
          transition: blastOffTransition
        });

        // 4. Reset states while out of frame
        setShowRocket(false);
        setShowParticles(false);
        await rocketControls.set({ y: 0, x: -500, opacity: 0 });

        // 5. Crash down (if mode stays launching, or we can just let it fall)
        await eyeballControls.start({
          y: [ -800, 0 ],
          scale: 1,
          transition: { type: 'spring', bounce: 0.6, duration: 1, delay: 0.2 }
        });

        // Open eyes and smile now that we've recovered!
        setIsFlying(false);
        setIsGiggling(true);

        // 6. Shake/giggle once after recovering!
        await gigglesControls.start({
          rotate: [...GIGGLE_KEYFRAMES.rotate],
          y: [...GIGGLE_KEYFRAMES.y],
          transition: { duration: 0.85, ease: 'easeOut' },
        });
        await gigglesControls.start({ rotate: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } });

        setIsGiggling(false);
        setIsLocked(false);
      };
      playLaunch();
    } else {
      // Ensure we reset if mode changes abruptly
      eyeballControls.set({ y: 0, scale: 1 });
      setShowRocket(false);
      setShowParticles(false);
      setIsFlying(false);
      setIsLocked(false);
    }
  }, [mode, rocketControls, eyeballControls]);

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
    if (isGiggling || isLocked) return; // freeze during giggle or predefined animation

    // If in generating mode with a target, override mouse tracking
    let targetX = pupilOffset.x;
    let targetY = pupilOffset.y;

    if (mode === 'generating' && gazeTarget && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      const eyeCx = r.left + r.width / 2;
      const eyeCy = r.top + r.height / 2;
      const dx = gazeTarget.x - eyeCx;
      const dy = gazeTarget.y - eyeCy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx);
      const rad = Math.min(dist * 0.13, maxRadius);
      targetX = Math.cos(ang) * rad;
      targetY = Math.sin(ang) * rad;
    }

    irisX.set(targetX);
    irisY.set(targetY);
    pupilX.set(targetX * 0.22);
    pupilY.set(targetY * 0.22);
    smileX.set(targetX * 0.6);
    smileY.set(targetY * 0.6);
  }, [pupilOffset, irisX, irisY, pupilX, pupilY, smileX, smileY, isGiggling, isLocked, mode, gazeTarget, maxRadius]);

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
  }, [isExcited, isGiggling, mode]);

  // Squint when generating OR when blastoff is occurring
  const isSquinting = (mode === 'generating' && generationProgress < 1) || isFlying;

  const smilePath: string = isSquinting
    ? 'M 10 25 Q 50 25 90 25' // Straight line
    : (isGiggling ? 'M 2 4 Q 50 44 98 4' : (SMILE_VARIANTS[smileIdx]?.d ?? SMILE_VARIANTS[0].d));
  
  // Show mouth (big grin) if excited/giggling. Also keep mouth open during launch build-up for excitement!
  const showMouth = (isExcited && mode === 'idle') || isGiggling || (mode === 'launching' && !isFlying);

  // Progress Ring Circumference
  const ringRadius = size / 2 - 2;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <div
      className="eye-container relative"
      ref={containerRef}
      style={{ width: size, height: size }}
    >
      {/* ── Rocket Component ──────────────────────────────────────── */}
      <AnimatePresence>
        {showRocket && (
          <motion.div
            initial={{ x: -1500, y: 50, rotate: 45, scale: 0.5, opacity: 0 }}
            animate={rocketControls}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginLeft: -scale(size, 220) / 2, // center the rocket based on size
              marginTop: -scale(size, 220) / 2 + size * 0.8, // lower it so eyeball rides on top
              width: scale(size, 220),
              height: scale(size, 220),
              zIndex: 3,
              pointerEvents: 'none'
            }}
          >
            <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rocket Body */}
              <path d={ROCKET_PATH} fill="#FF7A00" stroke="#FFF" strokeWidth="4" />
              {/* Window */}
              <circle cx="55.5" cy="39.5" r="14.5" fill="#111827" stroke="#FFF" strokeWidth="3" />
              {/* Flame (Visible on blastoff) */}
              {showParticles && (
                <motion.path
                  d="M 36 84 L 55.5 110 L 75 84 Z"
                  fill="#FF3B30"
                  animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 0.1 }}
                  style={{ transformOrigin: 'top center' }}
                />
              )}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={mode === 'error' ? errorControls : mode === 'launching' ? eyeballControls : gigglesControls}
        onClick={handleClick}
        className="giggle-wrapper"
        style={{ cursor: 'pointer', zIndex: 10, position: 'relative' }}
      >
        {/* Generation Progress Ring (Moved OUTSIDE sclera to prevent Clipping) */}
        <AnimatePresence>
          {mode === 'generating' && (
            <motion.svg
              initial={{ opacity: 0, scale: 1 }}
              animate={{ 
                opacity: generationProgress >= 1 ? 0 : 1,
                scale: generationProgress >= 1 ? 3 : 1
              }}
              transition={{ 
                duration: generationProgress >= 1 ? 0.7 : 0.3, 
                ease: "easeOut" 
              }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1, // Behind sclera if possible, or right on edge
                pointerEvents: 'none',
                transform: 'rotate(-90deg)', // Start from top
              }}
            >
              <motion.circle
                cx="50%"
                cy="50%"
                r={ringRadius}
                fill="none"
                stroke="#FF7A00"
                strokeLinecap="round"
                style={{
                  filter: generationProgress >= 1 
                    ? 'drop-shadow(0 0 16px rgba(255,122,0,1))' 
                    : 'drop-shadow(0 0 8px rgba(255,122,0,0.8))'
                }}
                initial={{ strokeDasharray: ringCircumference, strokeDashoffset: ringCircumference, strokeWidth: 4 }}
                animate={{ 
                  strokeDashoffset: ringCircumference - (generationProgress * ringCircumference),
                  strokeWidth: generationProgress >= 1 ? 12 : 4
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* ── Sclera ──────────────────────────────────────────────── */}
        <div className={`sclera ${version}`} style={{ width: size, height: size }}>
          {version === 'modern' && (
            <div className="glass-reflection" style={{
              width: size * 0.8,
              height: size * 0.4,
              top: '5%',
              left: '10%'
            }} />
          )}

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
              <motion.div 
                className={`iris ${version}`} 
                style={{ width: irisSize, height: irisSize }}
                animate={{ scaleY: isSquinting ? 0.65 : 1, scaleX: isSquinting ? 1.05 : 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.div
                  className={`pupil ${version}`}
                  style={{ x: pupilX, y: pupilY, width: pupilSize, height: pupilSize }}
                  animate={{ scaleY: isSquinting ? 0.6 : 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Spiral if Error, else Catchlights */}
                  {mode === 'error' ? (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="80%" height="80%" viewBox="0 0 100 100" fill="none">
                        <motion.path 
                          d="M 50 50 m 0 -40 a 40 40 0 1 1 0 80 a 40 40 0 1 1 0 -80 m 0 10 a 30 30 0 1 0 0 60 a 30 30 0 1 0 0 -60 m 0 10 a 20 20 0 1 1 0 40 a 20 20 0 1 1 0 -40 m 0 10 a 10 10 0 1 0 0 20 a 10 10 0 1 0 0 -20" 
                          stroke="#FF7A00" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                          initial={{ pathLength: 1, rotate: 0 }}
                          animate={{ rotate: 360 * 3 }}
                          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                        />
                      </svg>
                    </div>
                  ) : (
                    <>
                      <div className="catchlight catchlight-main" style={{
                        width: scale(size, 13),
                        height: scale(size, 13),
                        top: scale(size, 8),
                        left: scale(size, 9),
                      }} />
                      {version === 'modern' && (
                        <div className="catchlight catchlight-center" style={{
                          width: scale(size, 4),
                          height: scale(size, 4),
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          opacity: 0.3
                        }} />
                      )}
                      <div className="catchlight catchlight-secondary" style={{
                        width: scale(size, 6),
                        height: scale(size, 6),
                        top: scale(size, 26),
                        left: scale(size, 28),
                      }} />
                    </>
                  )}
                </motion.div>
                {version === 'modern' && <div className="iris-overlay" />}
              </motion.div>
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
