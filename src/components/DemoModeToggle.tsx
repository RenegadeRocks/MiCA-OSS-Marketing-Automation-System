import React, { useEffect, useState } from 'react';

export const DemoModeToggle: React.FC = () => {
    // Read from localStorage directly to initialize state
    const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('mica_demo_mode') === 'true');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if controls should be hidden (for actual Demo Day presentation)
        const hideControls = import.meta.env.VITE_HIDE_DEMO_CONTROLS === 'true';
        if (hideControls) {
            setIsVisible(false);
        }

        // Keyboard shortcut listener
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                toggleDemoMode();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const toggleDemoMode = () => {
        const newValue = !isDemoMode;
        localStorage.setItem('mica_demo_mode', String(newValue));
        setIsDemoMode(newValue);

        // Reload to ensure all components pick up the new mode cleanly
        window.location.reload();
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Bottom pill badge - Only visible when Demo Mode is ON */}
            {isDemoMode && (
                <div className="fixed bottom-14 left-4 bg-amber-500 text-black text-[10px] font-bold flex items-center gap-2 z-[100] rounded-full px-3 py-1 shadow-md">
                    <span>🎮 DEMO MODE</span>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleDemoMode}
                className={`fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 rounded-full 
                    border text-sm font-medium shadow-lg transition-all transform hover:scale-105
                    ${isDemoMode
                        ? 'bg-slate-800 border-green-500/50 text-white hover:bg-slate-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                title="Toggle Demo Mode (Ctrl+Shift+D)"
            >
                {isDemoMode ? (
                    <>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-green-400 font-bold">Demo Mode ON</span>
                    </>
                ) : (
                    <>
                        <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                        <span className="text-gray-500">Demo Mode</span>
                    </>
                )}
            </button>
        </>
    );
};
