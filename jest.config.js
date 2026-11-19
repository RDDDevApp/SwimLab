// Deux familles de tests :
// - « unit » : services, utilitaires et parcours, sous Node, avec React Native simulé
// - « screens » : écrans rendus pour de vrai (preset jest-expo + Testing Library)
const unit = {
  displayName: 'unit',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/screens/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: false }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__stubs__/react-native.ts',
    '^react-native-paper$': '<rootDir>/src/__stubs__/react-native-paper.ts',
  },
};

const screens = {
  displayName: 'screens',
  preset: 'jest-expo',
  testMatch: ['**/__tests__/screens/**/*.test.tsx'],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.screens.setup.js'],
};

module.exports = { projects: [unit, screens] };
