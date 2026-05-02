import { useState, useEffect, useRef } from 'react';
import { useSpring, motion } from 'framer-motion';
import { useAnimationContext } from '../context/AnimationContext';
import EyeCharacter from './EyeCharacter';
import { useEyeballMood } from '../contexts/EyeballMoodContext';

interface Props {
  onGiggle: () => void;
  version?: 'modern' | 'classic';
}

export default function FloatingHeroEyeball({ onGiggle, version = 'modern' }: Props) {
  const { mood, concentrationProgress } = useEyeballMood();

  // Start roughly center right
  const [targetPos, setTargetPos] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.75 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400
  });

  // Is it currently chasing the mouse?
  const isChasingRef = useRef(false);

  const { mode, gazeTarget, eyeballHidden } = useAnimationContext();

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Smoother, floaty ease-in/ease-out spring physics
  // Snap faster for generating, softer for launching so it's not too abrupt
  const getStiffness = () => {
    if (mode === 'generating') return 120;
    if (mode === 'launching') return 60;
    return 40;
  };
  const getDamping = () => {
    if (mode === 'generating') return 14;
    if (mode === 'launching') return 18;
    return 20;
  };

  const springX = useSpring(targetPos.x, { 
    stiffness: getStiffness(), 
    damping: getDamping(), 
    mass: 1.5 
  });
  const springY = useSpring(targetPos.y, { 
    stiffness: getStiffness(), 
    damping: getDamping(), 
    mass: 1.5 
  });

  useEffect(() => {
    springX.set(targetPos.x);
    springY.set(targetPos.y);
  }, [targetPos, springX, springY]);

  // ── Concentration: lock eyeball near the progress area ─────────────────
  useEffect(() => {
    if (mood === 'concentrating') {
      isChasingRef.current = false;
      // Position to the right of the generation card (roughly 70% width, 45% height)
      setTargetPos({
        x: window.innerWidth * 0.70,
        y: window.innerHeight * 0.45,
      });
    }
  }, [mood]);

  // ── Step-completion bounce: brief spring impulse when progress changes ──
  const prevProgressRef = useRef(concentrationProgress);
  useEffect(() => {
    if (mood === 'concentrating' && concentrationProgress > prevProgressRef.current) {
      // Quick bounce: offset briefly then snap back
      const baseY = window.innerHeight * 0.45;
      setTargetPos(prev => ({ ...prev, y: baseY - 30 }));
      setTimeout(() => {
        setTargetPos(prev => ({ ...prev, y: baseY }));
      }, 300);
    }
    prevProgressRef.current = concentrationProgress;
  }, [concentrationProgress, mood]);

  useEffect(() => {
    // Skip autonomous brain when not idle
    if (mood !== 'idle') return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Returns true if (x, y) is too close to any data-eyeball-avoid element
    const isOverlappingAvoid = (x: number, y: number) => {
      const margin = 90; // buffer ~= eyeball radius + padding
      for (const el of document.querySelectorAll('[data-eyeball-avoid]')) {
        const r = el.getBoundingClientRect();
        if (x > r.left - margin && x < r.right + margin &&
            y > r.top - margin && y < r.bottom + margin) return true;
      }
      return false;
    };

    // Fallback: pick a position near the screen edge, away from center content
    const safeEdgePos = () => ({
      x: Math.random() > 0.5
        ? 80 + Math.random() * 120
        : window.innerWidth - 80 - Math.random() * 120,
      y: 90 + Math.random() * (window.innerHeight - 200),
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = Math.max(90, e.clientY); // Don't chase cursor under the header
      if (isChasingRef.current && modeRef.current !== 'focused') {
        const chaseX = mouseX + 80;
        const chaseY = mouseY + 80;
        // Don't chase if it would land on an avoid element
        if (!isOverlappingAvoid(chaseX, chaseY)) {
          setTargetPos({ x: chaseX, y: chaseY });
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // The Autonomous Brain
    const pickNewTarget = () => {
      // 20% chance to chase the mouse enthusiastically to encourage a click
      if (Math.random() < 0.2) {
        const chaseX = mouseX + 80;
        const chaseY = mouseY + 80;
        if (!isOverlappingAvoid(chaseX, chaseY)) {
          isChasingRef.current = true;
          setTargetPos({ x: chaseX, y: chaseY });
          // Stop chasing after 2.5s
          setTimeout(() => { isChasingRef.current = false; }, 2500);
          return;
        }
        // Mouse is near an avoid element — fall through to wander instead
      }

      // Otherwise, find areas of interest
      isChasingRef.current = false;
      const interests = document.querySelectorAll('[data-interest]');

      if (interests.length > 0 && Math.random() < 0.7) { // 70% chance to visit an interest
        const targetEl = interests[Math.floor(Math.random() * interests.length)];
        const rect = targetEl.getBoundingClientRect();

        // Pick a point around the element.
        // For buttons, go near them. For the video stack, hover near top or bottom.
        const goTop = Math.random() > 0.5;

        // Calculate a snappy position around the element
        const destX = rect.left + (Math.random() * rect.width);
        const destY = goTop ? Math.max(90, rect.top - 70) : Math.min(window.innerHeight - 50, rect.bottom + 70);

        setTargetPos(isOverlappingAvoid(destX, destY) ? safeEdgePos() : { x: destX, y: destY });
      } else {
        // Wander somewhere random but safe
        const randX = 100 + Math.random() * (window.innerWidth - 200);
        const randY = 90 + Math.random() * (window.innerHeight - 190);
        setTargetPos(isOverlappingAvoid(randX, randY) ? safeEdgePos() : { x: randX, y: randY });
      }
    };

    // Pick a new target every 3 to 6 seconds
    let activeTimeout: ReturnType<typeof setTimeout>;
    
    const intervalCycle = () => {
      // Pick a new target if idle, otherwise wait
      if (modeRef.current === 'idle') {
        pickNewTarget();
      }
      activeTimeout = setTimeout(intervalCycle, 3000 + Math.random() * 3000);
    };

    // Start cycle
    activeTimeout = setTimeout(intervalCycle, 2000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(activeTimeout);
    };
  }, [mood]);

  // Jump to specific coordinates depending on the mode
  useEffect(() => {
    if (mode === 'generating' && gazeTarget) {
      // Position eyeball to the right of the target text (approx 300px offset)
      setTargetPos({
        x: gazeTarget.x + (typeof window !== 'undefined' ? 300 : 0),
        y: gazeTarget.y
      });
    } else if (mode === 'launching') {
      // Move exactly to bottom-center of the screen before the rocket arrives
      setTargetPos({
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 800,
        y: typeof window !== 'undefined' ? window.innerHeight * 0.66 : 600
      });
    } else if (mode === 'focused') {
      // Retreat to top-right corner so it doesn't cover form fields
      isChasingRef.current = false;
      setTargetPos({
        x: typeof window !== 'undefined' ? window.innerWidth - 90 : 800,
        y: 90,
      });
    }
  }, [mode, gazeTarget]);

  return (
    <motion.div
      animate={{ opacity: eyeballHidden ? 0 : 1 }}
      transition={{ opacity: { duration: 0.8, ease: 'easeInOut' } }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x: springX,
        y: springY,
        // offset so the center of the eye is exactly at x,y
        translateX: '-50%',
        translateY: '-50%',
        zIndex: 50,
        pointerEvents: 'none' // Outer wrapper always passthrough; EyeCharacter's giggle-wrapper retains its own clicks
      }}
    >
      <EyeCharacter
        size={100}
        onGiggle={onGiggle}
        version={version}
      />
    </motion.div>
  );
}
