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
module.exports = {
  extends: [
    '../../.eslintrc.js',
    'eslint-config-react-app',
    'plugin:react/recommended'
  ],
  plugins: ['react', 'formatjs'],
  env: {
    es6: true,
    browser: true,
    node: true
  },
  rules: {
    'react-hooks/exhaustive-deps': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@sentry/browser',
            message: `Errors should be sent to Sentry from few centralised places of our codebase.
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
          }
        ]
      }
    ],
    'formatjs/enforce-id': 'error',
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
    'react/prop-types': 'off'
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json']
      }
    }
  ],

  globals: {},
  parser: '@typescript-eslint/parser'
}
