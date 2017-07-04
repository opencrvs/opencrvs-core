/**
 * Default aliases for seneca.
 */
module.exports = {
  'silent': {
    handled: true,
    handler: function () { return [] }
  },
  'all': {
    handled: true,
    handler: function () { return ['debug', 'info', 'warn', 'error', 'fatal'] }
  },
  'test': {
    handled: true,
    handler: function () { return ['error', 'fatal'] }
  }
}
