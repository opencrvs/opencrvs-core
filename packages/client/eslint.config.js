/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

const { FlatCompat } = require('@eslint/eslintrc')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const tsParser = require('@typescript-eslint/parser')
const path = require('path')
const eventsConfig = require('./eslint.events.config.js')
const legacyConfig = require('./eslint.legacy.config.js')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})

/**
 * Client runs two different rule sets. One for v2 and the other for rest.
 * Each of them have their own config files.
 */
module.exports = [
  {
    ignores: [
      'test-runner-jest.config.js',
      'build/**/*',
      'eslint*',
      '**/*.js',
      '**/__mocks__/**/*'
    ]
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended'
  ),
  {
    plugins: {
      react,
      'react-hooks': reactHooks
    }
  },
  {
    languageOptions: {
      sourceType: 'commonjs',
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, './tsconfig.json')]
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, './tsconfig.json')
        }
      }
    }
  },
  ...eventsConfig,
  {
    files: ['./**/*.ts', './**/*.tsx'],
    /** To enforce relative imports, files propert needs to be defined. It cannot be shared through monorepo config at root. */
    rules: { 'import/no-relative-parent-imports': 'error' }
  },
  ...legacyConfig
]
