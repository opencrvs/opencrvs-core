/* Copyright (c) 2016 Richard Rodger, MIT License */
'use strict'

var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var expect = Code.expect

var GateExecutor = require('..')

describe('gate-executor', function () {
  it('readme', function (done) {
    var ge = GateExecutor()

    ge.add({
      fn: function first (done) {
        console.log('first')
        done()
      }
    })

    var subge = ge.gate()

    ge.add({
      fn: function second (done) {
        console.log('second')
        done()
      }
    })

    subge.add({
      fn: function second (done) {
        console.log('third')
        done()
      }
    })

    ge.start(function () {
      console.log('done')
      done()
    })

    // prints:
    //   first
    //   third
    //   second
    //   done
  })

  it('happy', function (done) {
    var log = []

    var ge = GateExecutor()

    ge.add({ fn: function aa (d) { log.push('aa'); d() } })
    ge.add({ fn: function bb (d) { log.push('bb'); d() } })


    var ge2 = ge.gate()
    ge2.add({ fn: function ccc (d) { log.push('ccc'); d() } })

    ge.add({ fn: function dd (d) { log.push('dd'); d() } })

    ge2.add({ fn: function ddd (d) { log.push('ddd'); d() } })

    expect(ge.state()).to.deep.equal([
      { s: 'w', ge: 1, d: 'aa', id: '1' },
      { s: 'w', ge: 1, d: 'bb', id: '2' },
      [ { s: 'w', ge: 2, d: 'ccc', id: '1' },
        { s: 'w', ge: 2, d: 'ddd', id: '2' } ],
      { s: 'w', ge: 1, d: 'dd', id: '4' } ])

    ge2.clear(function () {
      expect(log).to.deep.equal(['aa', 'bb', 'ccc', 'ddd'])
      expect(ge.state()).to.deep.equal([
        { s: 'w', ge: 1, d: 'dd', id: '4' } ])
    })

    ge.clear(function () {
      expect(log).to.deep.equal(['aa', 'bb', 'ccc', 'ddd', 'dd'])
      done()
    })

    ge.start()
  })


  it('running', function (done) {
    var log = []

    var ge = GateExecutor()

    ge.add({ fn: function aa (d) { log.push('aa'); d() } })
    ge.add({ fn: function bb (d) { log.push('bb'); d() } })

    var cc = 0
    ge.clear(function () {
      ++cc
      if (1 === cc) {
        expect(log).to.deep.equal(['aa', 'bb'])
      }
      else if (2 === cc) {
        expect(log).to.deep.equal(['aa', 'bb', 'cc'])
        done()
      }
    })

    ge.start(function () {
      expect(log).to.deep.equal(['aa', 'bb'])
    })

    setImmediate(function () {
      ge.add({ fn: function cc (d) { log.push('cc'); d() } })
    })
  })


  it('timeout', function (done) {
    var log = []

    var ge = GateExecutor({ timeout: 200, interval: 11 })

    ge.add({
      fn: function aa (d) {
        log.push('s-aa')
        setTimeout(function () { log.push('e-aa'); d() }, 100)
      }
    })

    ge.add({
      fn: function bb (d) {
        log.push('s-bb')
        setTimeout(function () { log.push('e-bb'); d() }, 300)
      }
    })

    ge.add({
      fn: function cc (d) {
        log.push('s-cc')
        setTimeout(function () { log.push('e-cc'); d() }, 150)
      }
    })

    ge.add({
      tm: 50,
      ontm: function () {
        log.push('t-dd')
      },
      fn: function dd (d) {
        log.push('s-dd')
        setTimeout(function () { log.push('e-dd'); d() }, 150)
      }
    })

    ge.clear(function () {
      expect(log).to.deep.equal(
        [ 's-aa', 's-bb', 's-cc', 's-dd', 't-dd', 'e-aa', 'e-cc', 'e-dd' ])
      done()
    })

    ge.start()

    setTimeout(function () {
      expect(ge.state()).to.deep.equal([ { s: 'a', ge: 1, d: 'bb', id: '2' } ])
    }, 200)
  })

  it('timeout after clear', function (done) {
    var log = []

    var ge = GateExecutor({ timeout: 200, interval: 11 })

    var firstTime = true

    ge.add({
      fn: function aa (d) {
        log.push('s-aa')
        log.push('e-aa')
        d()
      }
    })

    ge.clear(function () {
      if (firstTime) {
        expect(log).to.deep.equal([ 's-aa', 'e-aa' ])
        firstTime = false

        ge.add({
          tm: 50,
          ontm: function () {
            log.push('t-bb')
          },
          fn: function bb (d) {
            log.push('s-bb')
            setTimeout(function () { log.push('e-bb'); d() }, 150)
          }
        })

        return
      }

      expect(log).to.deep.equal([ 's-aa', 'e-aa', 's-bb', 't-bb' ])
      done()
    })

    ge.start()

  })


  it('traverse', function (done) {

    var all = descend([], 1, 0)

    var ge_all = []
    for (var i = 0; i < all.length; ++i) {
      var b = build(all[i])
      b.i = i
      ge_all[i] = b
    }

    var log_all = []
    var j = 0
    ge_all.forEach(function (b) {
      b.ge.start(function () {
        log_all[b.i] = b.log
        j++
        if (j === ge_all.length) {
          verify()
        }
      })
    })

    function verify () {
      expect(log_all).to.deep.equal(Log_all_expected)

      // IMPORTANT: confirms memory usage is well-behaved
      expect(process.memoryUsage().rss).below(71000000)

      done()
    }

    function descend (all, gec, depth) {
      if (4 < depth) {
        return
      }

      var jump = all[all.length - 1] || []

      for (var ge = 0; ge < gec; ++ge) {
        var add_jump = jump.concat([])
        add_jump.push({ type: 'add', ge: ge })
        all.push(add_jump)
        descend(all, gec, depth + 1)
      }

      for (ge = 0; ge < gec; ++ge) {
        var gate_jump = jump.concat([])
        gate_jump.push({ type: 'gate', ge: ge })
        all.push(gate_jump)
        descend(all, gec + 1, depth + 1)
      }

      return all
    }


    function build (path) {
      var log = []
      var ge = [GateExecutor()]
      for (var i = 0; i < path.length; i++) {
        var part = path[i]
        var fn, n
        if ('add' === part.type) {
          n = 'a_p_' + i + '_g_' + part.ge
          eval("fn = function " + n + " (done) { log.push('" + n + "'); done() }")
          ge[part.ge].add({ fn: fn })
        }
        else if ('gate' === part.type) {
          var geI = ge.length
          ge[geI] = ge[part.ge].gate()
          n = 'g_p_' + i + '_g_' + part.ge
          eval("fn = function " + n + " (done) { log.push('" + n + "'); done() }")
          ge[geI].add({ fn: fn })
        }
      }

      return {
        log: log,
        ge: ge[0]
      }
    }
  })

  it('gate-timeout', function (done) {
    var log = []

    var ge = GateExecutor({ timeout: 200, interval: 11 })

    ge.add({
      id: 'aa',
      dn: 'Daa',
      fn: function (d) {
        log.push('s-aa')
        setTimeout(function () { log.push('e-aa'); d() }, 100)
      }
    })

    var ge2 = ge.gate()

    ge2.add({
      id: 'bb',
      dn: 'Dbb',
      tm: 400,
      fn: function bb (d) {
        log.push('s-bb')
        setTimeout(function () { log.push('e-bb'); d() }, 300)
      }
    })

    ge.add({
      id: 'cc',
      dn: 'Dcc',
      fn: function cc (d) {
        log.push('s-cc')
        setTimeout(function () { log.push('e-cc'); d() }, 100)
      }
    })

    ge.start(function () {
      expect(log).to.deep.equal([ 's-aa', 's-bb', 'e-aa', 'e-bb', 's-cc', 'e-cc' ])
      done()
    })
  })


  it('start-pause', function (done) {
    var log = []
    var ge = GateExecutor({ timeout: 200, interval: 11 })

    ge.add({
      fn: function (d) {
        log.push('s-aa')
        expect(ge.isclear()).to.equal(false)
        setTimeout(function () { log.push('e-aa'); d() }, 100)
      }
    })

    expect(ge.isclear()).to.equal(false)

    ge.start()
    ge.add({
      fn: function (d) {
        log.push('s-bb')
        expect(ge.isclear()).to.equal(false)
        setTimeout(function () { log.push('e-bb'); d() }, 100)
      }
    })

    ge.start(function () {
      throw new Error('should never get here as replaced')
    })

    ge.start(function () {
      expect(log).to.deep.equal([ 's-aa', 's-bb', 'e-aa', 'e-bb' ])
      expect(ge.isclear()).to.equal(true)
      ge.pause()

      ge.add({
        fn: function (d) {
          log.push('s-cc')
          expect(ge.isclear()).to.equal(false)
          setTimeout(function () { log.push('e-cc'); d() }, 100)
        }
      })

      setTimeout(function () {
        expect(log).to.deep.equal([ 's-aa', 's-bb', 'e-aa', 'e-bb' ])

        ge.start(function () {
          expect(log).to.deep.equal(
            [ 's-aa', 's-bb', 'e-aa', 'e-bb', 's-cc', 'e-cc' ])
          expect(ge.isclear()).to.equal(true)
          done()
        })
      }, 333)
    })
  })

  it('memory', function (done) {
    var ge = GateExecutor()
    var start = Date.now()

    for (var i = 0; i < 10000; ++i) {
      ge.add({
        fn: function foo (done) {
          done()
        }
      })
    }
    var added = Date.now()

    ge.start(function () {
      var end = Date.now()
      var ges = ge.state().internal

      expect(end - start).below(444)
      expect(added - start).below(222)
      expect(ges.qlen).to.equal(0)
      expect(ges.hlen).to.equal(0)
      expect(ges.klen).to.equal(0)
      expect(ges.tlen).to.equal(0)

      done()
    })
  })
})


var Log_all_expected = require('./log_all_expected.js')
