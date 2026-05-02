import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layout } from '../../components/Layout';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // DEMO LOGIN BACKDOOR
        if (email === 'demo@mica.ai' && password === 'demo123') {
            localStorage.setItem('mica_demo_mode', 'true');
            // Store a flag to show the toast after reload
            localStorage.setItem('show_demo_toast', 'true');
            // Force reload to trigger AuthContext demo logic
            window.location.href = '/create-campaign';
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/create-campaign');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to sign in');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
                <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-200 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                            disabled={loading}
                        >
                            Log In
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Sign Up
                        </Link>
                    </div>
                    <div className="mt-2 text-center text-sm">
                        <Link to="#" className="text-gray-500 hover:text-gray-400">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
