import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for Demo Mode first
        const isDemoMode = localStorage.getItem('mica_demo_mode') === 'true';

        if (isDemoMode) {
            // Mock session for Demo Mode
            const mockUser: User = {
                id: 'demo-user-id',
                aud: 'authenticated',
                role: 'authenticated',
                email: 'demo@mica.ai',
                email_confirmed_at: new Date().toISOString(),
                phone: '',
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                app_metadata: { provider: 'email', providers: ['email'] },
                user_metadata: { full_name: 'Demo User' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const mockSession: Session = {
                access_token: 'demo-token',
                token_type: 'bearer',
                expires_in: 3600,
                refresh_token: 'demo-refresh-token',
                user: mockUser,
            };

            setSession(mockSession);
            setUser(mockUser);
            setLoading(false);
            return; // Skip Supabase auth listener
        }

        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((err) => {
                // Auth backend unreachable (DNS failure, project paused, network offline).
                // Don't gate the UI on this — public routes must render regardless.
                console.error('Auth getSession failed:', err);
                setLoading(false);
            });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        localStorage.removeItem('mica_demo_mode');
        await supabase.auth.signOut();
        // Force reload to clear any demo state
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
