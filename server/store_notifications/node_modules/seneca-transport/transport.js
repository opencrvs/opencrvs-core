/* Copyright (c) 2013-2015 Richard Rodger & other contributors, MIT License */
/* jshint node:true, asi:true, eqnull:true */
'use strict'

// Load modules
var _ = require('lodash')
var LruCache = require('lru-cache')
var Tcp = require('./lib/tcp')
var TransportUtil = require('./lib/transport-utils.js')
var Http = require('./lib/http')

// Declare internals
var internals = {
  defaults: {
    msgprefix: 'seneca_',
    callmax: 111111,
    msgidlen: 12,
    warn: {
      unknown_message_id: true,
      invalid_kind: true,
      invalid_origin: true,
      no_message_id: true,
      message_loop: true,
      own_message: true
    },
    check: {
      message_loop: true,
      own_message: true
    },
    web: {
      type: 'web',
      port: 10101,
      host: '0.0.0.0',
      path: '/act',
      protocol: 'http',
      timeout: 5555,
      max_listen_attempts: 11,
      attempt_delay: 222,
      serverOptions: {}
    },
    tcp: {
      type: 'tcp',
      host: '0.0.0.0',
      port: 10201,
      timeout: 5555
    }
  },
  plugin: 'transport'
}

module.exports = function transport (options) {
  var seneca = this

  var settings = seneca.util.deepextend(internals.defaults, options)
  var callmap = LruCache(settings.callmax)
  var transportUtil = new TransportUtil({
    callmap: callmap,
    seneca: seneca,
    options: settings
  })

  seneca.add({ role: internals.plugin, cmd: 'inflight' }, internals.inflight(callmap))
  seneca.add({ role: internals.plugin, cmd: 'listen' }, internals.listen)
  seneca.add({ role: internals.plugin, cmd: 'client' }, internals.client)

  seneca.add({ role: internals.plugin, hook: 'listen', type: 'tcp' }, Tcp.listen(settings, transportUtil))
  seneca.add({ role: internals.plugin, hook: 'client', type: 'tcp' }, Tcp.client(settings, transportUtil))

  seneca.add({ role: internals.plugin, hook: 'listen', type: 'web' }, Http.listen(settings, transportUtil))
  seneca.add({ role: internals.plugin, hook: 'client', type: 'web' }, Http.client(settings, transportUtil))

  // Aliases.
  seneca.add({ role: internals.plugin, hook: 'listen', type: 'http' }, Http.listen(settings, transportUtil))
  seneca.add({ role: internals.plugin, hook: 'client', type: 'http' }, Http.client(settings, transportUtil))

  // Legacy API.
  seneca.add({ role: internals.plugin, hook: 'listen', type: 'direct' }, Http.listen(settings, transportUtil))
  seneca.add({ role: internals.plugin, hook: 'client', type: 'direct' }, Http.client(settings, transportUtil))

  return {
    name: internals.plugin,
    exportmap: { utils: transportUtil },
    options: settings
  }
}

module.exports.preload = function () {
  var seneca = this

  var meta = {
    name: internals.plugin,
    exportmap: {
      utils: function () {
        var transportUtil = seneca.export(internals.plugin).utils
        if (transportUtil !== meta.exportmap.utils) {
          transportUtil.apply(this, arguments)
        }
      }
    }
  }

  return meta
}

internals.inflight = function (callmap) {
  return function (args, callback) {
    var inflight = {}
    callmap.forEach(function (val, key) {
      inflight[key] = val
    })
    callback(null, inflight)
  }
}

internals.listen = function (args, callback) {
  var seneca = this

  var config = _.extend({}, args.config, { role: internals.plugin, hook: 'listen' })
  var listen_args = seneca.util.clean(_.omit(config, 'cmd'))
  var legacyError = internals.legacyError(seneca, listen_args.type)
  if (legacyError) {
    return callback(legacyError)
  }
  seneca.act(listen_args, callback)
}

internals.client = function (args, callback) {
  var seneca = this

  var config = _.extend({}, args.config, { role: internals.plugin, hook: 'client' })
  var client_args = seneca.util.clean(_.omit(config, 'cmd'))
  var legacyError = internals.legacyError(seneca, client_args.type)
  if (legacyError) {
    return callback(legacyError)
  }
  seneca.act(client_args, callback)
}

internals.legacyError = function (seneca, type) {
  if (type === 'pubsub') {
    return seneca.fail('plugin-needed', { name: 'seneca-redis-transport' })
  }
  if (type === 'queue') {
    return seneca.fail('plugin-needed', { name: 'seneca-beanstalkd-transport' })
  }
}
