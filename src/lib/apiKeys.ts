/**
 * Per-user API key storage with .env fallback.
 *
 * Resolution order:
 *   1. localStorage (set via the Settings page)
 *   2. import.meta.env.VITE_<NAME> (install-time .env)
 *
 * Demo mode short-circuits the AI services upstream — this helper does not
 * inspect demo mode itself; it only resolves a key.
 */

export type ApiKeyName =
    | 'OPENROUTER_API_KEY'
    | 'REPLICATE_API_TOKEN'
    | 'HEYGEN_API_KEY';

const STORAGE_PREFIX = 'mica_api_';

export function getApiKey(name: ApiKeyName): string {
    const fromStorage = localStorage.getItem(STORAGE_PREFIX + name);
    if (fromStorage) return fromStorage;
    const fromEnv = import.meta.env[`VITE_${name}`] as string | undefined;
    return fromEnv || '';
}

export function setApiKey(name: ApiKeyName, value: string): void {
    const trimmed = value.trim();
    if (trimmed) {
        localStorage.setItem(STORAGE_PREFIX + name, trimmed);
    } else {
        localStorage.removeItem(STORAGE_PREFIX + name);
    }
}

export function hasApiKey(name: ApiKeyName): boolean {
    return getApiKey(name).length > 0;
}

export function clearAllApiKeys(): void {
    for (const key of Object.keys(localStorage)) {
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key);
        }
    }
}

/** True when the key in localStorage is set (regardless of any .env value). */
export function hasStoredKey(name: ApiKeyName): boolean {
    return localStorage.getItem(STORAGE_PREFIX + name) !== null;
}
