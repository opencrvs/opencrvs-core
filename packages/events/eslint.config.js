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
const { defineConfig } = require('eslint/config')
const path = require('path')
const eventsConfig = require('../../eslint.events.config.js')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})

module.exports = defineConfig([
  { ignores: ['build/**/*', 'eslint*', 'vitest.config.ts'] },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ),
  {
    files: ['./src/**/*.ts', 'src/**/*.ts'],
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
    rules: {
      ...eventsConfig.rules,
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'off',
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
              pattern: '@events/**',
              group: 'external',
              position: 'after'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin']
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          name: '@opencrvs/commons/client',
          message: 'Please use @opencrvs/commons or @opencrvs/commons/events'
        },
        {
          name: 'slonik',
          importNames: ['sql'],
          message: 'Please import `sql` from `storage/postgres/events/db.ts`'
        }
      ]
    }
  }
])
