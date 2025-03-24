/* eslint-disable @typescript-eslint/no-require-imports */
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
const legacyConfig = require('../../eslint.config.js')
const tsParser = require('@typescript-eslint/parser')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})

module.exports = [
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended'
  ),
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, './tsconfig.json')]
      },
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.browser,
        // Define Vitest globals explicitly
        it: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, './tsconfig.json')
        }
      },
      react: {
        pragma: 'React',
        version: 'detect'
      }
    },
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      ...legacyConfig[0].rules,
      'no-eval': 'error',
      'no-console': 'warn',
      'import/prefer-default-export': 'off',
      'import/no-duplicates': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false
        }
      ],
      'import/no-unassigned-import': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@sentry/browser',
              message: `Errors should be sent to Sentry from a few centralized places in our codebase.
    Query component now sends errors automatically to Sentry.`
            },
            {
              name: '@apollo/client/react/components',
              importNames: ['Query'],
              message: `Please use our own <Query /> component instead from components/Query.tsx`
            },
            {
              name: 'date-fns',
              message: 'Please use submodules instead'
            },
            {
              name: '@opencrvs/commons',
              message:
                'Importing directly from `@opencrvs/commons` is not allowed. Use `@opencrvs/commons/client` instead.'
            }
          ],
          patterns: ['@opencrvs/commons/*', '!@opencrvs/commons/client']
        }
      ],
      'react/no-unescaped-entities': 'off',
      'react/destructuring-assignment': 'off',
      'react/jsx-filename-extension': [
        'warn',
        {
          extensions: ['.tsx']
        }
      ],
      'react/boolean-prop-naming': 'off',
      'react/sort-comp': 'off',
      'react/sort-prop-types': 'off',
      'react/prop-types': 'off'
    }
  },
  {
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, './tsconfig.json')]
      }
    },
    // Override for files in src/legacy-code
    files: ['src/v2-events/**/*.{ts,tsx}'],
    rules: {
      ...eventsConfig[0].rules,
      'max-lines': ['warn', 600],
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react/destructuring-assignment': 'warn',
      'react/jsx-key': 1,
      'react/jsx-no-literals': 1,
      'react/destructuring-assignment': 1,
      'react/jsx-sort-props': [
        1,
        {
          reservedFirst: true,
          callbacksLast: true,
          shorthandFirst: true
        }
      ],
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
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@client/*',
            '!@client/v2-events',
            '!@client/components',
            '!@client/utils',
            '!@client/navigation',
            '!@client/storage',
            '!@client/forms',
            '!@client/i18n',
            '!@client/search',
            '!@client/offline',
            '!@client/config'
          ]
        }
      ]
    }
  }
]
