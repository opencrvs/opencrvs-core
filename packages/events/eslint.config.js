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
const globals = require('globals')
const path = require('path')
const eventsConfig = require('../../eslint.events.config.js')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})

module.exports = [
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended'
  ),
  {
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, './tsconfig.json')]
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, './tsconfig.json')
        }
      },
      files: ['src/**/*.{ts}'],
      rules: {
        ...eventsConfig[0].rules,
        'max-lines': ['warn', 600],
        'no-console': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'import/order': [
          'error',
          {
            pathGroups: [
              {
                pattern: '@opencrvs/**',
                group: 'external',
                position: 'after'
              },
              {
                pattern: '@client/**',
                group: 'external',
                position: 'after'
              }
            ],
            pathGroupsExcludedImportTypes: ['builtin']
          }
        ]
      }
    }
  }
]
