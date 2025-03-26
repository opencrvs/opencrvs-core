/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed der the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
const { FlatCompat } = require('@eslint/eslintrc')
const path = require('path')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename)
})

module.exports = [
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended'
  ),
  {
    ignores: ['eslint*.js'],
    rules: {
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
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-use-before-define': 'warn',
      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            ':matches(Program > VariableDeclaration) > VariableDeclarator > ArrowFunctionExpression',
          message: 'Top-level arrow functions are not allowed.'
        }
      ],
      'no-shadow': 'warn',
      'no-undef-init': 'error',
      'no-return-assign': 'error',
      'vars-on-top': 'warn',
      'block-spacing': ['warn', 'always'],
      curly: ['warn', 'all'],
      'no-nested-ternary': 'warn',
      'no-multiple-empty-lines': 'warn',
      'prefer-const': 'warn',
      'block-scoped-var': 'warn',
      'import/no-cycle': 'warn',
      'max-lines': ['warn', 600],
      'no-eval': 'error',
      'no-shadow': 'warn'
    }
  }
]
