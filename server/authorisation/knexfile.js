

const Config = require('./src/config/config');
const knexConfig = Config.get('/knex');
module.exports = knexConfig;
