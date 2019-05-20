var stylelint = require('stylelint')

var messages = stylelint.utils.ruleMessages(ruleName, {
  expected: function(value) {
    return 'Use font style from theme.  Custom fonts are not allowed.'
  }
})
var ruleName = 'opencrvs/no-font-styles'

module.exports = stylelint.createPlugin(ruleName, function(enabled) {
  if (!enabled) {
    return
  }
  return function(root, result) {
    root.walkDecls(function(decl) {
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
