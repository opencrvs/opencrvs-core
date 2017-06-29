import bookshelf from '../bookshelf';

var Token = bookshelf.Model.extend({
    tableName: 'tokens',
    hasTimestamps: true
});

module.exports = bookshelf.model('Token', Token);