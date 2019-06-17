const path = require('path')
const { ESLINT_MODES } = require('@craco/craco')

module.exports = {
  eslint: {
    mode: ESLINT_MODES.file
  },
  webpack: {
    alias: {
      '@login': path.resolve(__dirname, 'src/')
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@login(.*)$': '<rootDir>/src/$1'
      }
    }
  }
}
