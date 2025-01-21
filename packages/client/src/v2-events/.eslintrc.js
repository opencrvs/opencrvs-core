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
  extends: '../../../../.eslintrc.events.js',
  rules: {
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
          '!@client/search'
        ]
      }
    ]
  }
}
