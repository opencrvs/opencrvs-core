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
const tsParser = require('@typescript-eslint/parser')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const path = require('path')
const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})

module.exports = [
  {
    ignores: [
      'src/v2-events/**/*.{ts,tsx}',
      './src/v2-events/**/*.ts',
      './src/v2-events/**/*.tsx'
    ]
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended'
  ),
  {
    plugins: {
      react,
      'react-hooks': reactHooks
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
    },
    rules: {
      'no-eval': 'error',
      'no-console': 'warn',
      'import/prefer-default-export': 'off',
      'import/no-duplicates': 'off',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false
        }
      ],
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
  }
]
