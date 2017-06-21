'use strict';

const schema = require('../../schema/authenticateUser');

exports.register = (server, options, next) => {
  server.route({
    path: '/login',
    method: 'POST',
    config: {
      description: 'User login',
      notes: 'Login with email or username and password.',
      tags: ['api'],
      validate: {
        payload: schema
      }
    },
    handler: require('./login')
  })

  next()
}

exports.register.attributes = {
  name: 'auth-routes'
}