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

/**
 * Defines rule set used in v2-events client and events service.
 */
module.exports = {
  rules: {
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/consistent-type-definitions': 'warn',
    '@typescript-eslint/default-param-last': 'error',
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-includes': 'warn',
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
    'no-unused-vars': 'off',
    'no-console': 'warn'
  }
}
