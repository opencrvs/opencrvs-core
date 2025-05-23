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

const path = require('path')
const { defineConfig } = require('eslint/config')
const baseConfig = require('../../eslint.config.js')

module.exports = defineConfig([
  { ignores: ['build/**/*', 'eslint*'] },
  ...baseConfig,
  {
    languageOptions: {
      sourceType: 'commonjs',
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
    files: ['./src/**/*.ts']
  },
  {
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
])
