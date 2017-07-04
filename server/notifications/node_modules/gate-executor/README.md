# gate-executor

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter chat][gitter-badge]][gitter-url]

#### A work queue that can be gated, stopping to wait for sub-queues to complete.

[Annotated Source](http://senecajs.github.io/gate-executor/doc/gate-executor.html)

A work execution queue that provides gating. Work items submitted to
the queue are called in order, and execute concurrently. However, if
the queue is *gated*, then a sub-queue is created, and work items
added to the sub-queue must complete first.

Gating operates to any depth, allowing you to form a tree-structured
queue that must complete breadth-first.

The queue also handles timeouts, so that failing work items do not
block processing. Timeouts use a shared `setInterval`, so are nice and
efficient.

Used by the [Seneca](http://senecajs.org/) microservice framework to
implement plugin initialisation.

# Usage


```js
var GateExecutor = require('gate-executor')

var ge = GateExecutor()

ge.add({
  fn: function first (done) {
    console.log('first')
    done()
  }
})

// create a gate
var subge = ge.gate()

ge.add({
  fn: function second (done) {
    console.log('second')
    done()
  }
})

// this needs to complete before 'second' can run
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
```

For detailed information, and API descriptions, see the
[Annotated Source](http://senecajs.github.io/gate-executor/doc/gate-executor.html)

# Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

# Testing

```js
npm test
```

[npm-badge]: https://badge.fury.io/js/gate-executor.svg
[npm-url]: https://badge.fury.io/js/gate-executor
[travis-badge]: https://api.travis-ci.org/rjrodger/gate-executor.svg
[travis-url]: https://travis-ci.org/rjrodger/gate-executor
[coveralls-badge]:https://coveralls.io/repos/rjrodger/gate-executor/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/rjrodger/gate-executor?branch=master
[david-badge]: https://david-dm.org/rjrodger/gate-executor.svg
[david-url]: https://david-dm.org/rjrodger/gate-executor
[gitter-badge]: https://badges.gitter.im/rjrodger/gate-executor.svg
[gitter-url]: https://gitter.im/rjrodger/gate-executor
