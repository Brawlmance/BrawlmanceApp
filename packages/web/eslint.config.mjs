import { defineConfig, globalIgnores } from 'eslint/config'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['**/node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'eslint.config.mjs']),
  ...coreWebVitals,
  eslintConfigPrettier,
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
])
