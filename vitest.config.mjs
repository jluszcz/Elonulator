import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.js',
        'public/**/*.js'
      ],
      exclude: [
        'src/__tests__/**',
        'public/script.js' // Browser entry point - DOM wiring only; calculation logic lives in calc.js
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    include: [
      '**/__tests__/**/*.test.js'
    ]
  }
});
