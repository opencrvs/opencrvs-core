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

const react = require('eslint-plugin-react')
const baseConfig = require('../../eslint.config.js')
const tsParser = require('@typescript-eslint/parser')
const path = require('path')

module.exports = [
  { ignores: ['test-runner-jest.config.js', 'build/**/*', 'eslint*'] },
  ...baseConfig,
  {
    plugins: {
      react
    },
    files: ['./src/**/*.ts', './src/**/*.tsx'],
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/destructuring-assignment': 'off',
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.tsx']
        }
      ],
      'react/boolean-prop-naming': 'off',
      'react/sort-comp': 'off',
      'react/sort-prop-types': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect'
      }
    },

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
  }
]
