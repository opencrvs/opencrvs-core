'use strict'

const Util = require('./lib/util')
const Aliases = require('./lib/aliases')
const _ = require('lodash')

function logfilter (options) {
  let level = options.level || 'info+'

  let calculatedLevels = []

  if (Util.level_exists(level)) {
    calculatedLevels.push(level)
  }
  // Level + notation
  else if (_.endsWith(level, '+')) {
    calculatedLevels = Util.log_level_plus(level.substring(0, level.length - 1))
  }
  // No level nor level+... it must be a custom alias
  else {
    let processedAliases = Object.assign(Aliases, options.aliases)
    let aliasInfo = processedAliases[level]
    if (aliasInfo) {
      let handled = _.get(aliasInfo, 'handled', true)
      if (handled) {
        calculatedLevels = aliasInfo.handler(options)
      }
    }
  }

  return function filter (data) {
    if (calculatedLevels.indexOf(data.level) !== -1) {
      let cloned = _.clone(data)
      if (options['omit-metadata']) {
        cloned = _.omit(cloned, ['seneca', 'level', 'when'])
      }
      if (options.omit && _.isArray(options.omit)) {
        cloned = _.omit(cloned, options.omit)
      }
      return cloned
    }
    return null
  }
}

module.exports = logfilter
