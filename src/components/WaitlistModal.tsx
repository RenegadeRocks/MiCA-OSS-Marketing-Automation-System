import { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WaitlistModalProps {
    visible: boolean;
    source: 'hero' | 'cta';
    onClose: () => void;
}

export default function WaitlistModal({ visible, source, onClose }: WaitlistModalProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus('loading');

        const { error } = await supabase.from('waitlist').insert({ email: email.trim().toLowerCase(), source });

        if (!error) {
            setStatus('success');
        } else if (error.code === '23505') {
            // unique violation — already registered
            setStatus('duplicate');
        } else {
            console.error('Waitlist insert error:', error);
            setStatus('error');
        }
    };

    const handleClose = () => {
        onClose();
        // reset after animation out
        setTimeout(() => { setEmail(''); setStatus('idle'); }, 300);
    };

    if (!visible) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={handleClose}
                style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(5,12,28,0.75)', backdropFilter: 'blur(10px)' }}
            >
                <motion.div
                    key="modal"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={e => e.stopPropagation()}
                    style={{ background: 'rgba(10,20,40,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,122,0,0.3)', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 0 60px rgba(255,122,0,0.15), 0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}
                >
                    {/* Header */}
                    <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.25)', color: '#FF7A00' }}>
                                <Sparkles size={16} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF7A00' }}>Early Access</span>
                        </div>
                        <button onClick={handleClose} style={{ padding: '6px', borderRadius: '8px', color: '#6B7280', background: 'transparent', border: 'none', cursor: 'pointer', lineHeight: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '16px 24px 24px' }}>
                        {status !== 'success' ? (
                            <>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px', lineHeight: 1.2 }}>
                                    Reserve your spot<br />
                                    <span style={{ color: '#FF7A00' }}>before the doors open.</span>
                                </h2>
                                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px', lineHeight: 1.6 }}>
                                    MiCA is in private beta. Drop your email and you'll be first in line when we launch — no spam, just your moment.
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            disabled={status === 'loading'}
                                            style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '13px', paddingBottom: '13px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                                            onFocus={e => (e.target.style.borderColor = 'rgba(255,122,0,0.5)')}
                                            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                                        />
                                    </div>

                                    {status === 'duplicate' && (
                                        <p style={{ fontSize: '12px', color: '#FF7A00', marginBottom: '10px' }}>
                                            👀 MiCA already has your email — you're in the queue.
                                        </p>
                                    )}
                                    {status === 'error' && (
                                        <p style={{ fontSize: '12px', color: '#F87171', marginBottom: '10px' }}>
                                            Something went wrong. Try again in a moment.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading' || !email.trim()}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: status === 'loading' ? 'rgba(255,122,0,0.5)' : '#FF7A00', border: 'none', color: 'white', fontWeight: 700, fontSize: '15px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', boxShadow: '0 0 24px rgba(255,122,0,0.35)', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.boxShadow = '0 0 40px rgba(255,122,0,0.6)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(255,122,0,0.35)'; }}
                                    >
                                        {status === 'loading' ? 'Securing your spot…' : 'Count me in →'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ textAlign: 'center', padding: '16px 0 8px' }}
                            >
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
                                    Spot secured.
                                </h3>
                                <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '20px' }}>
                                    We'll reach out the moment<br />
                                    <span style={{ color: '#FF7A00', fontWeight: 600 }}>the doors open.</span><br />
                                    Stay excited!
                                </p>
                                <button
                                    onClick={handleClose}
                                    style={{ padding: '10px 28px', borderRadius: '30px', background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.3)', color: '#FF7A00', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                                >
                                    Can't wait ✦
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
