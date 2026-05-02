import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Tech debt: ~55 `any`s remain across Dashboard / GeneratingCampaign / services.
      // Tracked as warnings so they're visible to contributors but don't fail CI.
      // See CONTRIBUTING.md — typing these properly is a welcome contribution.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow `_`-prefixed args/vars to mean "intentionally unused" (standard convention).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Fast-refresh complaints about mixing component + hook exports are dev-experience
      // hints, not bugs. Keep visible without failing CI.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
