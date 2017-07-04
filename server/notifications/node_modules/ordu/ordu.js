/* Copyright (c) 2016 Richard Rodger and other contributors, MIT License */
'use strict'


var Assert = require('assert')


module.exports = function (opts) {
  return new Ordu(opts)
}


var orduI = -1


function Ordu (opts) {
  var self = this
  ++orduI


  opts = opts || {}
  Assert('object' === typeof opts)

  opts.name = opts.name || 'ordu' + orduI


  self.add = api_add
  self.process = api_process
  self.tasknames = api_tasknames
  self.taskdetails = api_taskdetails
  self.toString = api_toString


  var tasks = []


  function api_add (spec, task) {
    task = task || spec

    Assert('function' === typeof task)

    if (!task.name) {
      Object.defineProperty(task, 'name', {
        value: opts.name + '_task' + tasks.length
      })
    }

    task.tags = spec.tags || []

    tasks.push(task)

    return self
  }


  // Valid calls:
  //   * process(spec, ctxt, data)
  //   * process(ctxt, data)
  //   * process(data)
  //   * process()
  function api_process () {
    var i = arguments.length
    var data = 0 < i && arguments[--i]
    var ctxt = 0 < i && arguments[--i]
    var spec = 0 < i && arguments[--i]

    data = data || {}
    ctxt = ctxt || {}
    spec = spec || {}

    spec.tags = spec.tags || []

    for (var tI = 0; tI < tasks.length; ++tI) {
      var task = tasks[tI]

      if (0 < spec.tags.length && !contains(task.tags, spec.tags)) {
        continue
      }

      var index$ = tI
      var taskname$ = task.name

      ctxt.index$ = index$
      ctxt.taskname$ = taskname$

      var res = task(ctxt, data)

      if (res) {
        res.index$ = index$
        res.taskname$ = taskname$
        res.ctxt$ = ctxt
        res.data$ = data
        return res
      }
    }

    return null
  }


  function api_tasknames () {
    return tasks.map(function (v) {
      return v.name
    })
  }


  function api_taskdetails () {
    return tasks.map(function (v) {
      return v.name + ':{tags:' + v.tags + '}'
    })
  }


  function api_toString () {
    return opts.name + ':[' + self.tasknames() + ']'
  }

  return self
}


function contains (all, some) {
  for (var i = 0; i < some.length; ++i) {
    if (-1 === all.indexOf(some[i])) {
      return false
    }
  }

  return true
}
