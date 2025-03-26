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
const tsParser = require('@typescript-eslint/parser')
const { defineConfig } = require('eslint/config')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})
module.exports = defineConfig([
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended'
  ),
  {
    ignores: ['eslint*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      parser: tsParser,
      globals: {
        ...globals.commonjs,
        ...globals.node,
        // Define Vitest globals explicitly
        it: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        vi: 'readonly', // Vitest mock functions
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      'import/namespace': 'off',
      'no-debugger': 'error',
      'prettier/prettier': [
        'error',
        {
          printWidth: 80,
          singleQuote: true,
          useTabs: false,
          tabWidth: 2,
          trailingComma: 'none',
          semi: false
        }
      ],
      'no-console': 'warn',
      'arrow-parens': 'off',
      'no-return-assign': 'off',
      'no-restricted-imports': 'error',
      'no-unreachable': 2,
      'import/no-unassigned-import': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-relative-parent-imports': 2,
      'import/named': 0,
      'import/no-duplicates': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-interface': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-object-literal-type-assertion': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off'
    }
  }
])
