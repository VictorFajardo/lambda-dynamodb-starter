import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  rootDir: './',

  collectCoverage: false,
  // coverageDirectory: 'coverage',
  // coverageReporters: ['text', 'html', 'lcov'],

  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 85,
  //     statements: 85,
  //   },
  // },

  // collectCoverageFrom: ['**/lambda/**/*.ts'],
};

export default config;
