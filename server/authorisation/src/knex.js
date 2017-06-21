
const Config = require('./config/config');
const knexConfig = Config.get('/knex');
module.exports = require( 'knex' )( knexConfig );
