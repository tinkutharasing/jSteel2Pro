module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community|react-native-vector-icons)/)',
  ],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js|jsx)'],
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/android/**',
    '!**/ios/**',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
