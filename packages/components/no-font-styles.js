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
var stylelint = require('stylelint')

var ruleName = 'opencrvs/no-font-styles'
var messages = stylelint.utils.ruleMessages(ruleName, {
  expected: function (value) {
    return 'Use font style from theme.  Custom fonts are not allowed.'
  }
})

module.exports = stylelint.createPlugin(ruleName, function (enabled) {
  if (!enabled) {
    return
  }
  return function (root, result) {
    root.walkDecls(function (decl) {
      if (
        decl.prop === 'font-family' ||
        decl.prop === 'font-size' ||
        decl.prop === 'line-height' ||
        decl.prop === 'letter-spacing' ||
        decl.prop === 'font-weight'
      ) {
        stylelint.utils.report({
          result,
          ruleName,
          message: messages.expected(decl.prop + ', ' + decl.value),
          node: decl,
          word: decl.value
        })
      }
    })
  }
})

module.exports.messages = messages
module.exports.ruleName = ruleName
