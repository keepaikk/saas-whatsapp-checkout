module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  globalSetup: '<rootDir>/src/tests/setup.ts',
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
};
