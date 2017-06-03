var declarations = require('./declarations.json');

exports.getRandomOne = function() {
  var totalAmount = declarations.length;
  var rand = Math.floor(Math.random() * totalAmount);
  return declarations[rand];
}
