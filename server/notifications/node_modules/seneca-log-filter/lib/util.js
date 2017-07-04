'use strict'

const log_levels = ['debug', 'info', 'warn', 'error', 'fatal']

/**
 * It returns the levels above the argument
 * @param  {String} logLevel the log level to calculate
 * @return {Array}           the list of logs above the argument
 */
function log_level_plus (logLevel) {
  let index = log_levels.indexOf(logLevel)
  if (index < 0) {
    return []
  }
  else {
    return log_levels.slice(index, log_levels.length)
  }
}

/**
 * Checks if a log level exists
 * @param  {string} level the level itself
 * @return {boolean}      true if the level exists
 */
function level_exists (level) {
  return log_levels.indexOf(level) !== -1
}

module.exports.log_level_plus = log_level_plus
module.exports.level_exists = level_exists
