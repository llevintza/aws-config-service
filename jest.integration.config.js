module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests/integration'],
    testMatch: [
        '**/integration/**/*.+(ts|tsx|js)',
        '**/*.integration.(test|spec).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/src/testing/jest.setup.ts'],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testTimeout: 30000,
    verbose: true,
    // Don't collect coverage for integration tests by default
    collectCoverage: false
};
