module.exports = {
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/jest.setup.js'],
      testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/src/modules/**/*.test.ts', '<rootDir>/src/services/**/*.test.ts', '<rootDir>/src/index.test.ts'],
      moduleFileExtensions: ['ts', 'js'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(jose|jwks-rsa)/)',
      ],
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/ui/**/*.test.tsx'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
    },
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 60,
      lines: 80,
      statements: 80
    }
  }
};
