/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:13:58 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:13:58 
 */

const Config = require('./config/config');
const knexConfig = Config.get('/knex');
module.exports = require( 'knex' )( knexConfig );
