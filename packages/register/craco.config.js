const path = require('path')
const { ESLINT_MODES } = require('@craco/craco')

module.exports = {
  eslint: {
    mode: ESLINT_MODES.file
  },
  webpack: {
    alias: {
      '@register': path.resolve(__dirname, 'src/')
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@register(.*)$': '<rootDir>/src/$1'
      }
    }
  }
}
