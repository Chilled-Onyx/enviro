/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: '../../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/unit/**/*.test.ts'],
  resetMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/lib/**'],
  coverageDirectory: './tmp/unit-coverage',
  moduleDirectories: ['node_modules', 'src'],
  coverageThreshold: {
    global: {
      lines: 100,
    }
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};