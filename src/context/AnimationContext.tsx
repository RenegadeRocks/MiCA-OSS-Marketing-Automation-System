import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type AnimationMode = 'idle' | 'generating' | 'launching' | 'error' | 'focused';

interface AnimationContextProps {
  mode: AnimationMode;
  setMode: (mode: AnimationMode) => void;
  // Progress from 0 to 1 for the generation mode
  generationProgress: number;
  setGenerationProgress: (progress: number) => void;
  // Where the eye should look (screen coordinates)
  gazeTarget: { x: number; y: number } | null;
  setGazeTarget: (target: { x: number; y: number } | null) => void;
  // Hide the eyeball entirely (e.g. on dashboard) — fades out with pointer-events disabled
  eyeballHidden: boolean;
  setEyeballHidden: (hidden: boolean) => void;
}

const AnimationContext = createContext<AnimationContextProps | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AnimationMode>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [gazeTarget, setGazeTarget] = useState<{ x: number; y: number } | null>(null);
  const [eyeballHidden, setEyeballHidden] = useState(false);

  return (
    <AnimationContext.Provider
      value={{
        mode,
        setMode,
        generationProgress,
        setGenerationProgress,
        gazeTarget,
        setGazeTarget,
        eyeballHidden,
        setEyeballHidden,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
};
