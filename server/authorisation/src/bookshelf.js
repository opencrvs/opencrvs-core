/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:02 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:14:02 
 */


import knex from './knex';

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
module.exports = bookshelf;
