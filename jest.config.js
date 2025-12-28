export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__tests__/**',
    '!src/index.js' // CloudFlare Worker - tested differently
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.js'
  ]
};
