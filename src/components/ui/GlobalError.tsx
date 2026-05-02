import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const GlobalError: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white py-2 px-4 text-center text-sm font-medium z-50 flex items-center justify-center gap-2 animate-fade-in shadow-lg shadow-red-500/20">
            <WifiOff className="w-4 h-4" />
            You appear to be offline. Some features may not work.
        </div>
    );
};
