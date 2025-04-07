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

const eventsConfig = require('../../eslint.events.config.js')
const { defineConfig } = require('eslint/config')
const path = require('path')

module.exports = defineConfig([
  {
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        project: [path.resolve(__dirname, './tsconfig.json')]
      }
    },
    plugins: {
      import: require('eslint-plugin-import')
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, './tsconfig.json')
        }
      }
    },
    files: [
      './src/events/**/*.ts',
      'src/events/**/*.ts',
      'src/conditionals/**/*.ts',
      './src/conditionals/**/*.ts'
    ],
    rules: {
      ...eventsConfig.rules,
      'import/no-relative-parent-imports': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '../events',
              message:
                "Don't import from '../events' directly under commons. Use the actual file (e.g., 'events/EventConfig') to avoid Zod type issues."
            },
            {
              name: './events',
              message:
                "Don't import from './events' directly under commons. Use the actual file (e.g., 'events/EventConfig') to avoid Zod type issues."
            }
          ],
          patterns: [
            '**/events/index',
            '**/events/index.ts',
            '**/events/index.js'
          ]
        }
      ]
    }
  }
])
