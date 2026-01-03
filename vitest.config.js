import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.js'
      ],
      exclude: [
        'src/__tests__/**',
        'src/index.js' // CloudFlare Worker - tested differently
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
