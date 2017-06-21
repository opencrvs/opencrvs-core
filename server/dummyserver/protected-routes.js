var express = require('express'),
    jwt     = require('express-jwt'),
    config  = require('./config'),
    declarationer  = require('./declarationer');

var app = module.exports = express.Router();

// Validate access_token
var jwtCheck = jwt({
  secret: config.secret,
  audience: config.audience,
  issuer: config.issuer
});

app.get('/api/protected/random-declaration',
  jwt({
    secret: config.secret,
    audience: config.audience,
    issuer: config.issuer
  }),
  function(req, res) {
    if (!req.user) return res.sendStatus(401);
    res.status(200).send({data: declarationer.getRandomOne()});
  });

    
  app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({message: "The token has expired"});
  }
});