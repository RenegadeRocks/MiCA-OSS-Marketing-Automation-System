import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimationProvider, useAnimationContext } from './context/AnimationContext';
import { EyeballMoodProvider } from './contexts/EyeballMoodContext';
import FloatingHeroEyeball from './components/FloatingHeroEyeball';
import PeekingVignette from './components/PeekingVignette';
import { DemoModeToggle } from './components/DemoModeToggle';
import { useIsMobile } from './hooks/useIsMobile';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';

const CreateCampaign = lazy(() => import('./pages/Campaign/CreateCampaign').then(m => ({ default: m.CreateCampaign })));
const TonePreview = lazy(() => import('./pages/Campaign/TonePreview').then(m => ({ default: m.TonePreview })));
const GeneratingCampaign = lazy(() => import('./pages/Campaign/GeneratingCampaign').then(m => ({ default: m.GeneratingCampaign })));
const Dashboard = lazy(() => import('./pages/Campaign/Dashboard').then(m => ({ default: m.Dashboard })));
const CampaignList = lazy(() => import('./pages/CampaignList').then(m => ({ default: m.CampaignList })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-950 text-white">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Inner app shell — needs access to AnimationContext (must be inside AnimationProvider)
function AppShell({
  eyeVersion,
  setEyeVersion,
}: {
  eyeVersion: 'modern' | 'classic';
  setEyeVersion: (v: 'modern' | 'classic') => void;
}) {
  const { setMode, eyeballHidden } = useAnimationContext();
  const isMobile = useIsMobile();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [vignetteVisible, setVignetteVisible] = useState(false);

  const idleTimeoutRef = useRef<NodeJS.Timeout>(null);
  const vignetteHideTimeoutRef = useRef<NodeJS.Timeout>(null);
  // Tracks whether any input/textarea/select is currently focused
  const isFocusedRef = useRef(false);
  const blurRestoreTimer = useRef<NodeJS.Timeout>(null);

  const triggerVignette = useCallback((duration = 2500) => {
    // Do not disturb the user while they are filling a form
    if (isFocusedRef.current) return;
    setVignetteVisible(true);
    if (vignetteHideTimeoutRef.current) clearTimeout(vignetteHideTimeoutRef.current);
    vignetteHideTimeoutRef.current = setTimeout(() => setVignetteVisible(false), duration);
  }, []);

  // ── Focus detection — quiets eyeball activity while user is typing ──────
  useEffect(() => {
    const FOCUS_SELECTORS = 'input, textarea, select, [contenteditable]';

    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.matches(FOCUS_SELECTORS)) return;

      // Cancel any pending blur-restore
      if (blurRestoreTimer.current) clearTimeout(blurRestoreTimer.current);

      isFocusedRef.current = true;
      setMode('focused');
      // Hide any currently visible vignette immediately
      setVignetteVisible(false);
    };

    const onFocusOut = (e: FocusEvent) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.matches(FOCUS_SELECTORS)) return;

      // Delay restore slightly to avoid flicker when tabbing between fields
      blurRestoreTimer.current = setTimeout(() => {
        isFocusedRef.current = false;
        setMode('idle');
      }, 200);
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      if (blurRestoreTimer.current) clearTimeout(blurRestoreTimer.current);
    };
  }, [setMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Reset the idle timer (triggers vignette after 3s of NO mouse movement)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setVignetteVisible((prev) => {
          if (!prev) triggerVignette(2500);
          return prev || true;
        });
      }, 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    // Initial timer
    idleTimeoutRef.current = setTimeout(() => triggerVignette(2500), 3000);

    // The random trigger logic for peeking eyeballs
    const randomVignetteCycle = () => {
      setVignetteVisible((prev) => {
        if (!prev) triggerVignette(2500);
        return prev || true;
      });
      setTimeout(randomVignetteCycle, 30000 + Math.random() * 20000);
    };
    const rvTimeout = setTimeout(randomVignetteCycle, 20000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (vignetteHideTimeoutRef.current) clearTimeout(vignetteHideTimeoutRef.current);
      clearTimeout(rvTimeout);
    };
  }, [triggerVignette]);

  return (
    <>
      <DemoModeToggle />

      {/* Eyeball mascot + peeking vignette: desktop/tablet only.
          Hidden on phones (< 768px) where the floating elements overlap content. */}
      {!isMobile && (
        <>
          <PeekingVignette
            visible={vignetteVisible && !eyeballHidden}
            gazeX={mousePos.x / window.innerWidth}
            gazeY={mousePos.y / window.innerHeight}
            version={eyeVersion}
          />
          <FloatingHeroEyeball onGiggle={() => triggerVignette(2500)} version={eyeVersion} />
        </>
      )}

      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-950"><div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage version={eyeVersion} onVersionChange={setEyeVersion} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign/:id/tone-preview" element={<TonePreview />} />
            <Route path="/campaign/:id/generating" element={<GeneratingCampaign />} />
            <Route path="/campaign/:id/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/campaigns" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  const [eyeVersion, setEyeVersion] = useState<'modern' | 'classic'>('classic');

  return (
    <Router>
      <AuthProvider>
        <AnimationProvider>
          <EyeballMoodProvider>
            <AppShell eyeVersion={eyeVersion} setEyeVersion={setEyeVersion} />
          </EyeballMoodProvider>
        </AnimationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
