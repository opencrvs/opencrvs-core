

import knex from './knex';

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
module.exports = bookshelf;