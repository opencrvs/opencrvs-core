/* Copyright (c) 2013-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
'use strict'

// Load modules
var Buffer = require('buffer')
var Http = require('http')
var Https = require('https')
var Qs = require('qs')
var Url = require('url')
var _ = require('lodash')
var Jsonic = require('jsonic')
var Wreck = require('wreck')

// Declare internals
var internals = {}

exports.listen = function (options, transportUtil) {
  return function (msg, callback) {
    var seneca = this
    var listenOptions = seneca.util.deepextend(options[msg.type], msg)

    var server = (listenOptions.protocol === 'https') ? Https.createServer(listenOptions.serverOptions) : Http.createServer()

    var listener
    var listenAttempts = 0
    var listen_details = _.clone(msg)

    server.on('request', function (req, res) {
      internals.timeout(listenOptions, req, res)
      req.query = Qs.parse(Url.parse(req.url).query)
      internals.setBody(seneca, transportUtil, req, res, function (err) {
        if (err) {
          return res.end()
        }

        internals.trackHeaders(listenOptions, seneca, transportUtil, req, res)
      })
    })

    server.on('error', function (err) {
      if ('EADDRINUSE' === err.code && listenAttempts < listenOptions.max_listen_attempts) {
        listenAttempts++
        seneca.log.warn('listen', 'attempt', listenAttempts, err.code, listenOptions)
        setTimeout(listen, 100 + Math.floor(Math.random() * listenOptions.attempt_delay))
        return
      }
      callback(err)
    })

    server.on('listening', function () {
      listen_details.port = server.address().port
      seneca.log.debug('listen', listen_details)
      callback(null, listen_details)
    })

    function listen () {
      listener = server.listen(
        listen_details.port = transportUtil.resolveDynamicValue(listenOptions.port, listenOptions),
        listen_details.host = transportUtil.resolveDynamicValue(listenOptions.host, listenOptions)
      )
    }

    transportUtil.close(seneca, function (done) {
      // node 0.10 workaround, otherwise it throws
      if (listener && listener._handle) {
        listener.close()
      }
      done()
    })

    listen()
  }
}

exports.client = function (options, transportUtil) {
  return function (msg, callback) {
    var seneca = this
    var clientOptions = seneca.util.deepextend(options[msg.type], msg)
    var defaultHeaders = null

    // these are seneca internal, users are not allowed to change them
    if (options[msg.type].headers) {
      defaultHeaders = _.omit(options[msg.type].headers,
        ['Accept', 'Content-Type', 'Content-Length', 'Cache-Control', 'seneca-id',
          'seneca-kind', 'seneca-origin', 'seneca-track', 'seneca-time-client-sent',
          'seneca-accept', 'seneca-time-listen-recv', 'seneca-time-listen-sent'])
    }

    var send = function (spec, topic, send_done) {
      var host = transportUtil.resolveDynamicValue(clientOptions.host, clientOptions)
      var port = transportUtil.resolveDynamicValue(clientOptions.port, clientOptions)
      var path = transportUtil.resolveDynamicValue(clientOptions.path, clientOptions)

      // never use a 0.0.0.0 as targeted host, because Windows can't handle it
      host = host === '0.0.0.0' ? '127.0.0.1' : host

      var url = clientOptions.protocol + '://' + host + ':' + port + path
      seneca.log.debug('client', 'web', 'send', spec, topic, clientOptions, url)

      function action (msg, done) {
        var data = transportUtil.prepare_request(this, msg, done)

        var headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'seneca-id': data.id,
          'seneca-kind': 'req',
          'seneca-origin': seneca.id,
          'seneca-track': transportUtil.stringifyJSON(seneca, 'send-track', data.track || []),
          'seneca-time-client-sent': data.time.client_sent
        }

        if (defaultHeaders) {
          _.assign(headers, defaultHeaders)
        }

        var requestOptions = {
          json: true,
          headers: headers,
          timeout: clientOptions.timeout,
          payload: JSON.stringify(data.act)
        }

        Wreck.post(url, requestOptions, function (err, res, payload) {
          var data = {
            kind: 'res',
            res: payload && _.isObject(payload) ? payload : null,
            error: err,
            sync: msg.meta$.sync
          }

          if (res) {
            data.id = res.headers['seneca-id']
            data.origin = res.headers['seneca-origin']
            data.accept = res.headers['seneca-accept']
            data.time = {
              client_sent: res.headers['seneca-time-client-sent'],
              listen_recv: res.headers['seneca-time-listen-recv'],
              listen_sent: res.headers['seneca-time-listen-sent']
            }

            if (res.statusCode !== 200) {
              data.error = payload
            }
          }

          transportUtil.handle_response(seneca, data, clientOptions)
        })
      }

      send_done(null, action)

      transportUtil.close(seneca, function (done) {
        done()
      })
    }
    transportUtil.make_client(seneca, send, clientOptions, callback)
  }
}

internals.setBody = function (seneca, transportUtil, req, res, next) {
  var buf = []
  req.setEncoding('utf8')
  req.on('data', function (chunk) {
    buf.push(chunk)
  })
  req.on('end', function () {
    try {
      var bufstr = buf.join('')

      var bodydata = bufstr.length ? transportUtil.parseJSON(seneca, 'req-body', bufstr) : {}

      if (bodydata instanceof Error) {
        var out = transportUtil.prepareResponse(seneca, {})
        out.input = bufstr
        out.error = transportUtil.error('invalid_json', { input: bufstr })
        internals.sendResponse(seneca, transportUtil, res, out, {})
        return
      }

      req.body = _.extend(
        {},
        bodydata,

        // deprecated
        (req.query && req.query.args$) ? Jsonic(req.query.args$) : {},

        (req.query && req.query.msg$) ? Jsonic(req.query.msg$) : {},
        req.query || {}
      )

      next()
    }
    catch (err) {
      res.write(err.message + ': ' + bufstr)
      res.statusCode = 400
      next(err)
    }
  })
}

internals.trackHeaders = function (listenOptions, seneca, transportUtil, req, res) {
  if (req.url.indexOf(listenOptions.path) !== 0) {
    return
  }
  var data
  if (req.headers['seneca-id']) {
    data = {
      id: req.headers['seneca-id'],
      kind: 'act',
      origin: req.headers['seneca-origin'],
      track: transportUtil.parseJSON(seneca, 'track-receive', req.headers['seneca-track']) || [],
      time: {
        client_sent: req.headers['seneca-time-client-sent']
      },
      act: req.body
    }
  }

  // convenience for non-seneca clients
  if (!req.headers['seneca-id']) {
    data = {
      id: seneca.idgen(),
      kind: 'act',
      origin: req.headers['user-agent'] || 'UNKNOWN',
      track: [],
      time: {
        client_sent: Date.now()
      },
      act: req.body
    }
  }

  transportUtil.handle_request(seneca, data, listenOptions, function (out) {
    internals.sendResponse(seneca, transportUtil, res, out, data)
  })
}

internals.sendResponse = function (seneca, transportUtil, res, out, data) {
  var outJson = 'null'
  var httpcode = 200

  if (out && out.res) {
    httpcode = out.res.statusCode || httpcode
    outJson = transportUtil.stringifyJSON(seneca, 'listen-web', out.res)
  }
  else if (out && out.error) {
    httpcode = out.error.statusCode || 500
    outJson = transportUtil.stringifyJSON(seneca, 'listen-web', out.error)
  }

  var headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, max-age=0, no-cache, no-store',
    'Content-Length': Buffer.Buffer.byteLength(outJson)
  }

  headers['seneca-id'] = out && out.id ? out.id : seneca.id
  headers['seneca-kind'] = 'res'
  headers['seneca-origin'] = out && out.origin ? out.origin : 'UNKNOWN'
  headers['seneca-accept'] = seneca.id
  headers['seneca-track'] = '' + (data.track ? data.track : [])
  headers['seneca-time-client-sent'] =
    out && out.item ? out.time.client_sent : '0'
  headers['seneca-time-listen-recv'] =
    out && out.item ? out.time.listen_recv : '0'
  headers['seneca-time-listen-sent'] =
    out && out.item ? out.time.listen_sent : '0'

  res.writeHead(httpcode, headers)
  res.end(outJson)
}

internals.timeout = function (listenOptions, req, res) {
  var id = setTimeout(function () {
    res.statusCode = 503
    res.statusMessage = 'Response timeout'
    res.end('{ "code": "ETIMEDOUT" }')
  }, listenOptions.timeout || 5000)

  var clearTimeoutId = function () {
    clearTimeout(id)
  }

  req.once('close', clearTimeoutId)
  req.once('error', clearTimeoutId)
  res.once('error', clearTimeoutId)
  res.socket.once('data', clearTimeoutId)
}
