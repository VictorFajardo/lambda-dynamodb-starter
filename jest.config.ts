import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  rootDir: './',

  collectCoverage: true,
  // coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },

  // collectCoverageFrom: ['**/lib/**/*.ts', '**/lambda/**/*.ts'],
};

export default config;
