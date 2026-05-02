import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from '../context/AnimationContext';
import EyeCharacter from './EyeCharacter';

/**
 * MiCA Logo — bold text where individual letters randomly expand 
 * to reveal the acronym:
 *   M = Marketing
 *   i = intelligence
 *   C = Creative
 *   A = Automation
 */

interface LetterDef {
  char: string;
  fullWord: string;
  isLowercase?: boolean;
}

const LETTERS: LetterDef[] = [
  { char: 'M', fullWord: 'arketing' },
  { char: 'i', fullWord: 'ntelligence', isLowercase: true },
  { char: 'C', fullWord: 'reative' },
  { char: 'A', fullWord: 'utomation' },
];

export default function MiCALogo({ variant = 'hero', static: isStatic = false }: { variant?: 'hero' | 'header'; static?: boolean }) {
  // Which letter index (0-3) is randomly expanding, or -1 for none
  const [expandedIdx, setExpandedIdx] = useState(-1);
  // Which letter index is currently being hovered
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  const { mode } = useAnimationContext();

  // The index to actually display (hover takes precedence)
  // Force collapse (-1) during generating, launching, error modes, or when static
  const displayIdx = isStatic ? -1 : ((mode !== 'idle') ? -1 : (hoveredIdx !== -1 ? hoveredIdx : expandedIdx));

  useEffect(() => {
    // Static logos never auto-expand
    if (isStatic) return;
    // Stop auto-expansion if we are animating a state
    if (mode !== 'idle') {
      setExpandedIdx(-1);
      return;
    }

    let tOut: ReturnType<typeof setTimeout>;

    const cycle = () => {
      // Pick a random letter to expand
      const idx = Math.floor(Math.random() * LETTERS.length);
      setExpandedIdx(idx);

      // Collapse after 2.5s
      setTimeout(() => {
        setExpandedIdx(-1);
      }, 2500);

      // Schedule the next expansion 5-10s later
      tOut = setTimeout(cycle, 5000 + Math.random() * 5000);
    };

    // First expansion after 3s
    tOut = setTimeout(cycle, 3000);
    return () => clearTimeout(tOut);
  }, [mode]);

  const isHeader = variant === 'header';
  const mainFont = isHeader ? 'clamp(20px, 2.5vw, 30px)' : 'clamp(90px, 11vw, 140px)';
  const lowerFont = isHeader ? 'clamp(15px, 2vw, 24px)' : 'clamp(70px, 8vw, 110px)';
  const expandFont = isHeader ? 'clamp(7px, 0.75vw, 10px)' : 'clamp(28px, 3vw, 42px)';
  const eyeSize = isHeader ? 20 : 90;

  // Animation variants based on mode
  const getVariants = () => {
    if (mode === 'generating') {
      return {
        animate: {
          textShadow: [
            "0 0 10px rgba(255,122,0,0.5)",
            "0 0 30px rgba(255,122,0,1)",
            "0 0 10px rgba(255,122,0,0.5)"
          ],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
        }
      };
    }
    if (mode === 'launching') {
      return {
        animate: {
          color: ["#FF7A00", "#FFFFFF", "#FF7A00"],
          textShadow: [
            "0 0 10px rgba(255,122,0,0)",
            "0 0 50px rgba(255,255,255,1)",
            "0 0 10px rgba(255,122,0,0)"
          ],
          scale: [1, 1.05, 1],
          transition: { duration: 1, ease: "easeOut" as const }
        }
      };
    }
    if (mode === 'error') {
      return {
        animate: {
          color: ["#FF7A00", "#FF3B30", "#FF7A00", "#FF3B30", "#FF7A00"],
          textShadow: [
            "0 0 10px rgba(255,0,0,0)",
            "0 0 20px rgba(255,0,0,0.8)",
            "0 0 10px rgba(255,0,0,0)",
            "0 0 20px rgba(255,0,0,0.8)",
            "0 0 10px rgba(255,0,0,0)"
          ],
          x: [-2, 2, -2, 2, 0],
          transition: { duration: 0.4, ease: "linear" as const }
        }
      };
    }
    return { animate: {} };
  };

  const variants = getVariants();

  return (
    <div className={`flex items-baseline gap-0 select-none`} style={{ fontFamily: "'Inter', sans-serif" }}>
      {LETTERS.map((letter, i) => (
        <span
          key={i}
          className="inline-flex items-baseline relative cursor-default transition-transform duration-300 hover:scale-110"
          onMouseEnter={() => !isStatic && setHoveredIdx(i)}
          onMouseLeave={() => !isStatic && setHoveredIdx(-1)}
        >
          {/* The bold letter */}
          <motion.span
            className="font-black text-[#FF7A00] text-glow relative inline-block"
            animate={variants.animate}
            style={{
              fontSize: mainFont,
              lineHeight: 1,
              ...(letter.isLowercase ? { fontSize: lowerFont } : {}),
            }}
          >
            {letter.char === 'i' ? (
              <>
                {/* Dotless 'i' */}
                <span className="relative z-10">ı</span>
                <div className="absolute top-[0.08em] left-[52%] -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto" style={{ width: '0.25em', height: '0.25em' }}>
                  <div className="scale-[0.3] md:scale-[0.4] lg:scale-[0.45] origin-center">
                    <EyeCharacter size={eyeSize} />
                  </div>
                </div>
              </>
            ) : (
              letter.char
            )}
          </motion.span>

          {/* The expanding full word */}
          <AnimatePresence>
            {displayIdx === i && (
              <motion.span
                className="font-light text-[#FF7A00]/70 whitespace-nowrap overflow-hidden"
                style={{
                  fontSize: expandFont,
                  lineHeight: 1,
                  paddingBottom: '0.2em',
                  marginBottom: '-0.2em',
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <span className="inline-block pr-[8px] md:pr-[12px]">{letter.fullWord}</span>
              </motion.span>
            )}
          </AnimatePresence>

          {/* Add slight spacing between letter groups, but not after last */}
          {i < LETTERS.length - 1 && displayIdx !== i && (
            <span style={{ width: '2px' }} />
          )}
        </span>
      ))}
    </div>
  );
}
