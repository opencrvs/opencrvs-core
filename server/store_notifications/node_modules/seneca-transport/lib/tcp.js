/* Copyright (c) 2013-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
'use strict'

// Load modules
var Net = require('net')
var Stream = require('stream')
var Ndjson = require('ndjson')
var Reconnect = require('reconnect-core')
var _ = require('lodash')

// Declare internals
var internals = {}

exports.listen = function (options, transportUtil) {
  return function (args, callback) {
    var seneca = this
    var listenOptions = seneca.util.deepextend(options[args.type], args)

    var connections = []
    var listenAttempts = 0

    var listener = Net.createServer(function (connection) {
      seneca.log.debug('listen', 'connection', listenOptions,
                       'remote', connection.remoteAddress, connection.remotePort)

      var parser = Ndjson.parse()
      var stringifier = Ndjson.stringify()
      parser.on('error', function (error) {
        console.error(error)
        connection.end()
      })
      parser.on('data', function (data) {
        if (data instanceof Error) {
          var out = transportUtil.prepareResponse(seneca, {})
          out.input = data.input
          out.error = transportUtil.error('invalid_json', { input: data.input })

          stringifier.write(out)
          return
        }

        transportUtil.handle_request(seneca, data, options, function (out) {
          if (out === null || !out.sync) {
            return
          }

          stringifier.write(out)
        })
      })

      connection.pipe(parser)
      stringifier.pipe(connection)

      connection.on('error', function (err) {
        seneca.log.error('listen', 'pipe-error', listenOptions, err && err.stack)
      })

      connections.push(connection)
    })

    listener.once('listening', function () {
      listenOptions.port = listener.address().port
      seneca.log.debug('listen', 'open', listenOptions)
      return callback(null, listenOptions)
    })

    listener.on('error', function (err) {
      seneca.log.error('listen', 'net-error', listenOptions, err && err.stack)

      if ('EADDRINUSE' === err.code && listenAttempts < listenOptions.max_listen_attempts) {
        listenAttempts++
        seneca.log.warn('listen', 'attempt', listenAttempts, err.code, listenOptions)
        setTimeout(listen, 100 + Math.floor(Math.random() * listenOptions.attempt_delay))
        return
      }
    })

    listener.on('close', function () {
      seneca.log.debug('listen', 'close', listenOptions)
    })

    function listen () {
      if (listenOptions.path) {
        listener.listen(listenOptions.path)
      }
      else {
        listener.listen(listenOptions.port, listenOptions.host)
      }
    }
    listen()

    transportUtil.close(seneca, function (next) {
      // node 0.10 workaround, otherwise it throws
      if (listener._handle) {
        listener.close()
      }
      internals.closeConnections(connections, seneca)
      next()
    })
  }
}

exports.client = function (options, transportUtil) {
  return function (args, callback) {
    var seneca = this
    var type = args.type
    if (args.host) {
      // under Windows host, 0.0.0.0 host will always fail
      args.host = args.host === '0.0.0.0' ? '127.0.0.1' : args.host
    }
    var clientOptions = seneca.util.deepextend(options[args.type], args)
    clientOptions.host = !args.host && clientOptions.host === '0.0.0.0' ? '127.0.0.1' : clientOptions.host

    var send = function (spec, topic, send_done) {
      seneca.log.debug('client', type, 'send-init', spec, topic, clientOptions)

      var connections = []
      var established = false

      var reconnect = internals.reconnect(function (stream) {
        // unique connections are by the options e.g. host:port
        // don't need to pipe everything again if it exists
        // established is for a race condition for `connect` event pushing
        var existing = _.find(connections, { clientOptions: clientOptions })
        if (!established || existing && existing.setup) {
          return
        }

        var msger = internals.clientMessager(seneca, clientOptions, transportUtil)
        var parser = Ndjson.parse()
        var stringifier = Ndjson.stringify()

        stream
          .pipe(parser)
          .pipe(msger)
          .pipe(stringifier)
          .pipe(stream)

        existing.setup = true

        send_done(null, function (args, done) {
          var outmsg = transportUtil.prepare_request(this, args, done)
          if (!outmsg.replied) stringifier.write(outmsg)
        })
      })

      reconnect.on('connect', function (connection) {
        seneca.log.debug('client', type, 'connect', spec, topic, clientOptions)
        connection.clientOptions = clientOptions // unique per connection
        connections.push(connection)
        established = true
      })
      reconnect.on('reconnect', function () {
        seneca.log.debug('client', type, 'reconnect', spec, topic, clientOptions)
      })
      reconnect.on('disconnect', function (err) {
        seneca.log.debug('client', type, 'disconnect', spec, topic, clientOptions,
           (err && err.stack) || err)
        _.find(connections, { clientOptions: clientOptions }).setup = false
      })
      reconnect.on('error', function (err) {
        seneca.log.debug('client', type, 'error', spec, topic, clientOptions, err.stack)
      })

      reconnect.connect({
        port: clientOptions.port,
        host: clientOptions.host
      })

      transportUtil.close(seneca, function (done) {
        reconnect.disconnect()
        internals.closeConnections(connections, seneca)
        done()
      })
    }

    transportUtil.make_client(seneca, send, clientOptions, callback)
  }
}

internals.clientMessager = function (seneca, options, transportUtil) {
  var messager = new Stream.Duplex({ objectMode: true })
  messager._read = function () {}
  messager._write = function (data, enc, callback) {
    transportUtil.handle_response(seneca, data, options)
    return callback()
  }
  return messager
}

internals.closeConnections = function (connections, seneca) {
  for (var i = 0, il = connections.length; i < il; ++i) {
    internals.destroyConnection(connections[i], seneca)
  }
}

internals.destroyConnection = function (connection, seneca) {
  try {
    connection.destroy()
  }
  catch (e) {
    seneca.log.error(e)
  }
}

internals.reconnect = Reconnect(function () {
  var args = [].slice.call(arguments)
  return Net.connect.apply(null, args)
})
