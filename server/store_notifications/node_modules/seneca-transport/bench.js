'use strict'

var Bench = require('bench')
var Seneca = require('seneca')
var Transport = require('./')

var color = function () {
  this.add('color:red', function (args, callback) {
    callback(null, { hex: '#FF0000' })
  })
}

Seneca({ log: 'silent', default_plugins: { tranport: true }, transport: { port: 9998 } }).use(color).listen()
var publishedClient = Seneca({ log: 'silent', default_plugins: { tranport: true }, transport: { port: 9998 } })
  .client()

Seneca({ log: 'silent', default_plugins: { tranport: false }, transport: { port: 9999 } }).use(color).use(Transport).listen()
var localClient = Seneca({ log: 'silent', default_plugins: { tranport: false }, transport: { port: 9999 } })
  .use(Transport).client()

exports.compare = {
  'published transport': function (done) {
    publishedClient.act('color:red', done)
  },
  'local transport': function (done) {
    localClient.act('color:red', done)
  }
}

Bench.runMain()
