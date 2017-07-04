/* Copyright (c) 2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
'use strict'

// Load modules
var Util = require('util')
var _ = require('lodash')
var Nid = require('nid')
var Patrun = require('patrun')
var Jsonic = require('jsonic')
var Eraro = require('eraro')

// Declare internals
var internals = {
  error: Eraro({
    package: 'seneca',
    msgmap: {
      'no_data': 'The message has no data.',
      'invalid_kind_act': 'Inbound messages should have kind "act", kind was: <%=kind%>.',
      'no_message_id': 'The message has no identifier.',
      'invalid_origin': 'The message response is not for this instance, origin was <%=origin%>.',
      'unknown_message_id': 'The message has an unknown identifier',
      'own_message': 'Inbound message rejected as originated from this server.',
      'message_loop': 'Inbound message rejected as looping back to this server.',
      'data_error': 'Inbound message included an error description.',
      'invalid_json': 'Invalid JSON: <%=input%>.',
      'unexcepted_async_error': 'Unexcepted error response to asynchronous message.'
    },
    override: true
  })
}

module.exports = internals.Utils = function (context) {
  this._msgprefix = (!context.options.msgprefix ? '' : context.options.msgprefix)
  this._context = context
}

internals.Utils.prototype.error = internals.error // fixes #63

internals.Utils.prototype.handle_response = function (seneca, data, client_options) {
  data.time = data.time || {}
  data.time.client_recv = Date.now()
  data.sync = void 0 === data.sync ? true : data.sync

  if (data.kind !== 'res') {
    if (this._context.options.warn.invalid_kind) {
      seneca.log.warn('client', 'invalid_kind_res', client_options, data)
    }
    return false
  }

  if (data.id === null) {
    if (this._context.options.warn.no_message_id) {
      seneca.log.warn('client', 'no_message_id', client_options, data)
    }
    return false
  }

  if (seneca.id !== data.origin) {
    if (this._context.options.warn.invalid_origin) {
      seneca.log.warn('client', 'invalid_origin', client_options, data)
    }
    return false
  }

  var err = null
  var result = null

  if (data.error) {
    err = new Error(data.error.message)

    _.each(data.error, function (value, key) {
      err[key] = value
    })

    if (!data.sync) {
      seneca.log.warn('client', 'unexcepted_async_error', client_options, data, err)
      return true
    }
  }
  else {
    result = this.handle_entity(seneca, data.res)
  }

  if (!data.sync) {
    return true
  }

  var callmeta = this._context.callmap.get(data.id)

  if (callmeta) {
    this._context.callmap.del(data.id)
  }
  else {
    if (this._context.options.warn.unknown_message_id) {
      seneca.log.warn('client', 'unknown_message_id', client_options, data)
    }
    return false
  }


  var actinfo = {
    id: data.id,
    accept: data.accept,
    track: data.track,
    time: data.time
  }

  this.callmeta({
    callmeta: callmeta,
    err: err,
    result: result,
    actinfo: actinfo,
    seneca: seneca,
    client_options: client_options,
    data: data
  })

  return true
}

internals.Utils.prototype.callmeta = function (options) {
  try {
    options.callmeta.done(options.err, options.result, options.actinfo)
  }
  catch (e) {
    options.seneca.log.error('client', 'callback_error', options.client_options, options.data, e.stack || e)
  }
}

internals.Utils.prototype.prepare_request = function (seneca, args, done) {
  args.meta$.sync = void 0 === args.meta$.sync ? true : args.meta$.sync

  var callmeta = {
    args: args,
    done: _.bind(done, seneca),
    when: Date.now()
  }

  // store callback only if sync is response expected
  if (args.meta$.sync) {
    this._context.callmap.set(args.meta$.id, callmeta)
  }
  else {
    this.callmeta({
      callmeta: callmeta,
      err: null,
      result: null,
      actinfo: null,
      seneca: seneca,
      client_options: null,
      data: null
    })
  }

  var track = []
  if (args.transport$) {
    track = _.clone((args.transport$.track || []))
  }
  track.push(seneca.id)

  var output = {
    id: args.meta$.id,
    kind: 'act',
    origin: seneca.id,
    track: track,
    time: { client_sent: Date.now() },
    act: seneca.util.clean(args),
    sync: args.meta$.sync
  }

  return output
}

internals.Utils.prototype.handle_request = function (seneca, data, listen_options, respond) {
  if (!data) {
    return respond({ input: data, error: internals.error('no_data') })
  }

  // retain transaction information from incoming request
  var ids = data.id && data.id.split('/')
  var tx = ids && ids[1]
  seneca.fixedargs.tx$ = tx || seneca.fixedargs.tx$

  if (data.kind !== 'act') {
    if (this._context.options.warn.invalid_kind) {
      seneca.log.warn('listen', 'invalid_kind_act', listen_options, data)
    }
    return respond({
      input: data,
      error: internals.error('invalid_kind_act', { kind: data.kind })
    })
  }

  if (data.id === null) {
    if (this._context.options.warn.no_message_id) {
      seneca.log.warn('listen', 'no_message_id', listen_options, data)
    }
    return respond({ input: data, error: internals.error('no_message_id') })
  }

  if (this._context.options.check.own_message && this._context.callmap.has(data.id)) {
    if (this._context.options.warn.own_message) {
      seneca.log.warn('listen', 'own_message', listen_options, data)
    }
    return respond({ input: data, error: internals.error('own_message') })
  }

  if (this._context.options.check.message_loop && Array.isArray(data.track)) {
    for (var i = 0; i < data.track.length; i++) {
      if (seneca.id === data.track[i]) {
        if (this._context.options.warn.message_loop) {
          seneca.log.warn('listen', 'message_loop', listen_options, data)
        }
        return respond({ input: data, error: internals.error('message_loop') })
      }
    }
  }

  if (data.error) {
    seneca.log.error('listen', 'data_error', listen_options, data)
    return respond({ input: data, error: internals.error('data_error') })
  }

  var output = this.prepareResponse(seneca, data)
  var input = this.handle_entity(seneca, data.act)

  input.transport$ = {
    track: data.track || [],
    origin: data.origin,
    time: data.time
  }

  input.id$ = data.id

  this.requestAct(seneca, input, output, respond)
}

internals.Utils.prototype.requestAct = function (seneca, input, output, respond) {
  var self = this

  try {
    seneca.act(input, function (err, out) {
      self.update_output(input, output, err, out)
      respond(output)
    })
  }
  catch (e) {
    self.catch_act_error(seneca, e, input, {}, output)
    respond(output)
  }
}

internals.Utils.prototype.make_client = function (context_seneca, make_send, client_options, client_done) {
  var instance = this._context.seneca

  // legacy api
  if (!context_seneca.seneca) {
    client_done = client_options
    client_options = make_send
    make_send = context_seneca
  }
  else {
    instance = context_seneca
  }

  var pins = this.resolve_pins(client_options)
  instance.log.debug('client', client_options, pins || 'any')

  var finish = function (err, send) {
    if (err) {
      return client_done(err)
    }
    client_done(null, send)
  }

  if (pins) {
    var argspatrun = this.make_argspatrun(pins)
    var resolvesend = this.make_resolvesend(client_options, {}, make_send)

    return this.make_pinclient(client_options, resolvesend, argspatrun, finish)
  }

  this.make_anyclient(client_options, make_send, finish)
}

internals.Utils.prototype.make_anyclient = function (opts, make_send, done) {
  var self = this
  make_send({}, this._msgprefix + 'any', function (err, send) {
    if (err) {
      return done(err)
    }
    if (typeof send !== 'function') {
      return done(self._context.seneca.fail('null-client', { opts: opts }))
    }

    var client = {
      id: opts.id || Nid(),
      toString: function () { return 'any-' + this.id },

      // TODO: is this used?
      match: function (args) {
        return !this.has(args)
      },

      send: function (args, done) {
        send.call(this, args, done)
      }
    }

    done(null, client)
  })
}

internals.Utils.prototype.make_pinclient = function (opts, resolvesend, argspatrun, done) {
  var client = {
    id: opts.id || Nid(),
    toString: function () {
      return 'pin-' + argspatrun.mark + '-' + this.id
    },

    // TODO: is this used?
    match: function (args) {
      var match = !!argspatrun.find(args)
      return match
    },

    send: function (args, done) {
      var seneca = this
      var spec = argspatrun.find(args)

      resolvesend(spec, args, function (err, send) {
        if (err) {
          return done(err)
        }
        send.call(seneca, args, done)
      })
    }
  }

  done(null, client)
}

internals.Utils.prototype.resolve_pins = function (opts) {
  var pins = opts.pin || opts.pins
  if (pins) {
    pins = Array.isArray(pins) ? pins : [pins]
  }

  if (pins) {
    pins = _.map(pins, function (pin) {
      return (typeof pin === 'string') ? Jsonic(pin) : pin
    })
  }

  return pins
}

internals.Utils.prototype.make_argspatrun = function (pins) {
  var argspatrun = Patrun({ gex: true })

  _.each(pins, function (pin) {
    var spec = { pin: pin }
    argspatrun.add(pin, spec)
  })

  argspatrun.mark = Util.inspect(pins).replace(/\s+/g, '').replace(/\n/g, '')

  return argspatrun
}

internals.Utils.prototype.make_resolvesend = function (opts, sendmap, make_send) {
  var self = this
  return function (spec, args, done) {
    var topic = self.resolve_topic(opts, spec, args)
    var send = sendmap[topic]
    if (send) {
      return done(null, send)
    }

    make_send(spec, topic, function (err, send) {
      if (err) {
        return done(err)
      }
      sendmap[topic] = send
      done(null, send)
    })
  }
}

internals.Utils.prototype.resolve_topic = function (opts, spec, args) {
  var self = this
  if (!spec.pin) {
    return function () {
      return self._msgprefix + 'any'
    }
  }

  var topicpin = _.clone(spec.pin)

  var topicargs = {}
  _.each(topicpin, function (v, k) {
    topicargs[k] = args[k]
  })

  var sb = []
  _.each(_.keys(topicargs).sort(), function (k) {
    sb.push(k)
    sb.push('=')
    sb.push(topicargs[k])
    sb.push(',')
  })

  var topic = this._msgprefix + (sb.join('')).replace(/[^\w\d]+/g, '_')
  return topic
}

internals.Utils.prototype.listen_topics = function (seneca, args, listen_options, do_topic) {
  var self = this
  var topics = []

  var pins = this.resolve_pins(args)

  if (pins) {
    _.each(this._context.seneca.findpins(pins), function (pin) {
      var sb = []
      _.each(_.keys(pin).sort(), function (k) {
        sb.push(k)
        sb.push('=')
        sb.push(pin[k])
        sb.push(',')
      })

      var topic = self._msgprefix + (sb.join('')).replace(/[^\w\d]+/g, '_')

      topics.push(topic)
    })

    // TODO: die if no pins!!!
    // otherwise no listener established and seneca ends without msg
  }
  else {
    topics.push(this._msgprefix + 'any')
  }

  if (typeof do_topic === 'function') {
    topics.forEach(function (topic) {
      do_topic(topic)
    })
  }

  return topics
}

internals.Utils.prototype.update_output = function (input, output, err, out) {
  output.res = out

  if (err) {
    var errobj = _.extend({}, err)
    errobj.message = err.message
    errobj.name = err.name || 'Error'

    output.error = errobj
    output.input = input
  }

  output.time.listen_sent = Date.now()
}

internals.Utils.prototype.catch_act_error = function (seneca, e, listen_options, input, output) {
  seneca.log.error('listen', 'act-error', listen_options, e.stack || e)
  output.error = e
  output.input = input
}

// only support first level
// interim measure - deal with this in core seneca act api
// allow user to specify operations on result
internals.Utils.prototype.handle_entity = function (seneca, raw) {
  if (!raw) {
    return raw
  }

  raw = _.isObject(raw) ? raw : {}

  if (raw.entity$) {
    return seneca.make$(raw)
  }

  _.each(raw, function (value, key) {
    if (_.isObject(value) && value.entity$) {
      raw[key] = seneca.make$(value)
    }
  })

  return raw
}

  // legacy names
internals.Utils.prototype.resolvetopic = internals.Utils.prototype.resolve_topic

internals.Utils.prototype.close = function (seneca, closer) {
  seneca.add('role:seneca,cmd:close', function (close_args, done) {
    var seneca = this

    closer.call(seneca, function (err) {
      if (err) {
        seneca.log.error(err)
      }

      seneca.prior(close_args, done)
    })
  })
}

internals.Utils.prototype.stringifyJSON = function (seneca, note, obj) {
  if (!obj) {
    return
  }

  try {
    return JSON.stringify(obj)
  }
  catch (e) {
    seneca.log.warn('json-stringify', note, obj, e.message)
  }
}

internals.Utils.prototype.parseJSON = function (seneca, note, str) {
  if (!str) {
    return
  }

  try {
    return JSON.parse(str)
  }
  catch (e) {
    seneca.log.warn('json-parse', note, str.replace(/[\r\n\t]+/g, ''), e.message)
    e.input = str
    return e
  }
}

internals.Utils.prototype.prepareResponse = function (seneca, input) {
  return {
    id: input.id,
    kind: 'res',
    origin: input.origin,
    accept: seneca.id,
    track: input.track,
    time: {
      client_sent: (input.time && input.time.client_sent) || 0,
      listen_recv: Date.now()
    },
    sync: input.sync
  }
}

internals.Utils.prototype.resolveDynamicValue = function (value, options) {
  if (_.isFunction(value)) {
    return value(options)
  }
  return value
}
