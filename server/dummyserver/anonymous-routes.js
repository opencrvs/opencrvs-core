var express = require('express'),
    declarationer  = require('./declarationer');

var app = module.exports = express.Router();

app.get('/api/random-declaration', function(req, res) {
  res.status(200).send({data: declarationer.getRandomOne()});
});
