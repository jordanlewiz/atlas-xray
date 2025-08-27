module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@xenova/transformers$': '<rootDir>/src/utils/__mocks__/transformersMock.js',
    '^d3$': '<rootDir>/src/utils/__mocks__/d3Mock.js',
  },
  // Reduce verbose test output
  verbose: false,
};
