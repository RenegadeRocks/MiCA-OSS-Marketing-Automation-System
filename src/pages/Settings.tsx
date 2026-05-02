import React, { useState } from 'react';
import { Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    type ApiKeyName,
    getApiKey,
    setApiKey,
    clearAllApiKeys,
    hasStoredKey,
} from '../lib/apiKeys';

type KeySource = 'browser' | 'env' | 'unset';

function getKeySource(name: ApiKeyName): KeySource {
    if (hasStoredKey(name)) return 'browser';
    if (getApiKey(name)) return 'env';
    return 'unset';
}

type TestStatus =
    | { kind: 'idle' }
    | { kind: 'testing' }
    | { kind: 'ok' }
    | { kind: 'error'; message: string };

interface KeyConfig {
    name: ApiKeyName;
    label: string;
    description: string;
    helpUrl: string;
    test: (key: string) => Promise<void>; // throws on failure
}

const KEY_CONFIGS: KeyConfig[] = [
    {
        name: 'OPENROUTER_API_KEY',
        label: 'OpenRouter API key',
        description: 'Used for AI text generation (campaign copy, strategy, scripts).',
        helpUrl: 'https://openrouter.ai/keys',
        test: async (key) => {
            const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
                headers: { Authorization: `Bearer ${key}` },
            });
            if (!res.ok) {
                const body = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status}${body ? ` — ${body.slice(0, 120)}` : ''}`);
            }
        },
    },
    {
        name: 'REPLICATE_API_TOKEN',
        label: 'Replicate API token',
        description: 'Used for image generation (campaign visuals).',
        helpUrl: 'https://replicate.com/account/api-tokens',
        test: async (key) => {
            // Dev: via Vite proxy. Prod: direct (Replicate supports browser CORS).
            const url = import.meta.env.DEV
                ? '/api/replicate/account'
                : 'https://api.replicate.com/v1/account';
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${key}` },
            });
            if (!res.ok) {
                const body = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status}${body ? ` — ${body.slice(0, 120)}` : ''}`);
            }
        },
    },
    {
        name: 'HEYGEN_API_KEY',
        label: 'HeyGen API key',
        description: 'Used for AI avatar video generation (the launch video).',
        helpUrl: 'https://app.heygen.com/settings?nav=API',
        test: async (key) => {
            const url = import.meta.env.DEV
                ? '/api/heygen/v2/user/remaining_quota'
                : 'https://api.heygen.com/v2/user/remaining_quota';
            const res = await fetch(url, {
                headers: { 'X-Api-Key': key },
            });
            if (!res.ok) {
                const body = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status}${body ? ` — ${body.slice(0, 120)}` : ''}`);
            }
        },
    },
];

export const Settings: React.FC = () => {
    const isDemoMode = localStorage.getItem('mica_demo_mode') === 'true';

    // Initial values come from getApiKey, which already prefers localStorage over .env.
    const [values, setValues] = useState<Record<ApiKeyName, string>>(() => ({
        OPENROUTER_API_KEY: getApiKey('OPENROUTER_API_KEY'),
        REPLICATE_API_TOKEN: getApiKey('REPLICATE_API_TOKEN'),
        HEYGEN_API_KEY: getApiKey('HEYGEN_API_KEY'),
    }));

    const [sources, setSources] = useState<Record<ApiKeyName, KeySource>>(() => ({
        OPENROUTER_API_KEY: getKeySource('OPENROUTER_API_KEY'),
        REPLICATE_API_TOKEN: getKeySource('REPLICATE_API_TOKEN'),
        HEYGEN_API_KEY: getKeySource('HEYGEN_API_KEY'),
    }));

    const [testStatus, setTestStatus] = useState<Record<ApiKeyName, TestStatus>>({
        OPENROUTER_API_KEY: { kind: 'idle' },
        REPLICATE_API_TOKEN: { kind: 'idle' },
        HEYGEN_API_KEY: { kind: 'idle' },
    });

    const [savedToast, setSavedToast] = useState(false);

    const updateValue = (name: ApiKeyName, val: string) => {
        setValues((v) => ({ ...v, [name]: val }));
        setTestStatus((s) => ({ ...s, [name]: { kind: 'idle' } }));
    };

    const handleTest = async (config: KeyConfig) => {
        const key = values[config.name].trim();
        if (!key) {
            setTestStatus((s) => ({
                ...s,
                [config.name]: { kind: 'error', message: 'Enter a key first.' },
            }));
            return;
        }
        setTestStatus((s) => ({ ...s, [config.name]: { kind: 'testing' } }));
        try {
            await config.test(key);
            setTestStatus((s) => ({ ...s, [config.name]: { kind: 'ok' } }));
        } catch (err) {
            setTestStatus((s) => ({
                ...s,
                [config.name]: {
                    kind: 'error',
                    message: err instanceof Error ? err.message : String(err),
                },
            }));
        }
    };

    const handleSave = () => {
        for (const config of KEY_CONFIGS) {
            setApiKey(config.name, values[config.name]);
        }
        setSources({
            OPENROUTER_API_KEY: getKeySource('OPENROUTER_API_KEY'),
            REPLICATE_API_TOKEN: getKeySource('REPLICATE_API_TOKEN'),
            HEYGEN_API_KEY: getKeySource('HEYGEN_API_KEY'),
        });
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const handleClearAll = () => {
        if (!confirm('Remove all locally-saved API keys? The app will fall back to .env values if any are present.')) {
            return;
        }
        clearAllApiKeys();
        setValues({
            OPENROUTER_API_KEY: getApiKey('OPENROUTER_API_KEY'),
            REPLICATE_API_TOKEN: getApiKey('REPLICATE_API_TOKEN'),
            HEYGEN_API_KEY: getApiKey('HEYGEN_API_KEY'),
        });
        setSources({
            OPENROUTER_API_KEY: getKeySource('OPENROUTER_API_KEY'),
            REPLICATE_API_TOKEN: getKeySource('REPLICATE_API_TOKEN'),
            HEYGEN_API_KEY: getKeySource('HEYGEN_API_KEY'),
        });
        setTestStatus({
            OPENROUTER_API_KEY: { kind: 'idle' },
            REPLICATE_API_TOKEN: { kind: 'idle' },
            HEYGEN_API_KEY: { kind: 'idle' },
        });
    };

    return (
        <Layout>
            <div className="flex items-start justify-center min-h-[calc(100vh-12rem)] px-4 py-12">
                <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-400 text-sm mb-6">
                        Paste API keys to use your own AI providers. Keys are stored in your browser only — never sent anywhere except the providers themselves.
                    </p>

                    {isDemoMode && (
                        <div className="p-3 mb-6 rounded-lg bg-amber-900/30 border border-amber-800 text-amber-200 text-sm">
                            <strong>Demo mode is active.</strong> API keys are bypassed while demo mode is on. Turn it off (bottom-left toggle or <kbd className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-xs font-mono">Ctrl+Shift+D</kbd>) to use your own keys.
                        </div>
                    )}

                    <div className="space-y-6">
                        {KEY_CONFIGS.map((config) => {
                            const status = testStatus[config.name];
                            const source = sources[config.name];
                            return (
                                <div key={config.name} className="space-y-2">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <div className="flex items-baseline gap-2">
                                            <label className="text-sm font-medium text-gray-300">{config.label}</label>
                                            {source === 'browser' && (
                                                <span className="text-[10px] uppercase tracking-wide font-medium text-orange-400 bg-orange-950/40 border border-orange-900/60 rounded px-1.5 py-0.5">
                                                    Saved in this browser
                                                </span>
                                            )}
                                            {source === 'env' && (
                                                <span className="text-[10px] uppercase tracking-wide font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5">
                                                    Loaded from .env
                                                </span>
                                            )}
                                            {source === 'unset' && (
                                                <span className="text-[10px] uppercase tracking-wide font-medium text-gray-500 bg-gray-800/50 border border-gray-700/50 rounded px-1.5 py-0.5">
                                                    Not set
                                                </span>
                                            )}
                                        </div>
                                        <a
                                            href={config.helpUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-gray-400 hover:text-orange-400 inline-flex items-center gap-1"
                                        >
                                            Get a key <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-500">{config.description}</p>
                                    <div className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Input
                                                type="password"
                                                value={values[config.name]}
                                                onChange={(e) => updateValue(config.name, e.target.value)}
                                                placeholder="Paste key here"
                                                disabled={isDemoMode}
                                                autoComplete="off"
                                                spellCheck={false}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            onClick={() => handleTest(config)}
                                            disabled={isDemoMode || status.kind === 'testing' || !values[config.name].trim()}
                                        >
                                            {status.kind === 'testing' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Test'
                                            )}
                                        </Button>
                                    </div>
                                    {status.kind === 'ok' && (
                                        <div className="flex items-center gap-1.5 text-sm text-green-400">
                                            <Check className="w-4 h-4" /> Valid
                                        </div>
                                    )}
                                    {status.kind === 'error' && (
                                        <div className="flex items-start gap-1.5 text-sm text-red-400">
                                            <X className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span className="break-all">{status.message}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-800">
                        <Button variant="ghost" size="sm" onClick={handleClearAll} disabled={isDemoMode}>
                            Clear all keys
                        </Button>
                        <div className="flex items-center gap-3">
                            {savedToast && (
                                <span className="text-sm text-green-400 flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Saved
                                </span>
                            )}
                            <Button variant="primary" onClick={handleSave} disabled={isDemoMode}>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
