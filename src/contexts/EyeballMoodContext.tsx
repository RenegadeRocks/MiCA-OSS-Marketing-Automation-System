import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

export type EyeballMood = 'idle' | 'concentrating' | 'launching' | 'dizzy';

interface EyeballMoodContextType {
  mood: EyeballMood;
  setMood: (mood: EyeballMood) => void;
  concentrationProgress: number;
  setConcentrationProgress: (p: number) => void;
  concentrationStepIndex: number;
  setConcentrationStepIndex: (i: number) => void;
  /** Set mood to 'dizzy' for a duration, then revert to the given fallback mood */
  triggerDizzy: (fallbackMood?: EyeballMood, durationMs?: number) => void;
}

const EyeballMoodContext = createContext<EyeballMoodContextType | null>(null);

export function EyeballMoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<EyeballMood>('idle');
  const [concentrationProgress, setConcentrationProgress] = useState(0);
  const [concentrationStepIndex, setConcentrationStepIndex] = useState(0);
  const dizzyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDizzy = useCallback((fallbackMood: EyeballMood = 'idle', durationMs = 2500) => {
    if (dizzyTimerRef.current) clearTimeout(dizzyTimerRef.current);
    setMood('dizzy');
    dizzyTimerRef.current = setTimeout(() => {
      setMood(fallbackMood);
      dizzyTimerRef.current = null;
    }, durationMs);
  }, []);

  return (
    <EyeballMoodContext.Provider value={{
      mood, setMood,
      concentrationProgress, setConcentrationProgress,
      concentrationStepIndex, setConcentrationStepIndex,
      triggerDizzy,
    }}>
      {children}
    </EyeballMoodContext.Provider>
  );
}

export function useEyeballMood() {
  const ctx = useContext(EyeballMoodContext);
  if (!ctx) throw new Error('useEyeballMood must be used within EyeballMoodProvider');
  return ctx;
}
