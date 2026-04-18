import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import neostandard from 'neostandard'

export default defineConfig([
  ...neostandard({
    ts: true,
    env: ['node'],
    noJsx: true,
    ignores: ['**/node_modules/**', 'dist/**', 'eslint.config.mjs'],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
  }),
  eslintConfigPrettier,
  {
    rules: {
      'no-return-await': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      camelcase: ['error', { properties: 'never' }],
    },
  },
])
