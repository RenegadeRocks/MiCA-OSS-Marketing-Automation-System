import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layout } from '../../components/Layout';

export const Signup: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // DEMO SIGNUP BACKDOOR
        if (email === 'demo@mica.ai' && password === 'demo123') {
            localStorage.setItem('mica_demo_mode', 'true');
            localStorage.setItem('show_demo_toast', 'true');
            window.location.href = '/create-campaign';
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            // Auto login sometimes happens, but usually requires email confirmation depending on settings.
            // Assuming email confirmation is disabled for dev or handled via magic link, 
            // but for now we redirect to create-campaign or show "Check your email".
            // If session is established immediately (disabled confirmation), we are good.
            // If not, we might need to tell user to check email.
            // Checking if we have a session:
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/create-campaign');
            } else {
                // If email confirmation is on, session will be null
                navigate('/login'); // Or show a message "Please check your email"
                // For Session 1 MVP we assume simplified auth or immediate session
                // But let's just navigate to create-campaign if we can, else login
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to sign up');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
                <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Jane Doe"
                        />

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
                            placeholder="Min 6 characters"
                            minLength={6}
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
                            Sign Up
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
