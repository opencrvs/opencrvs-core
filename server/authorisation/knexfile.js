/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:13:36 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:13:36 
 */


const Config = require('./src/config/config');
const knexConfig = Config.get('/knex');
module.exports = knexConfig;
