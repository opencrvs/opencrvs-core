import bookshelf from '../bookshelf';

const Token = bookshelf.Model.extend({
    tableName: 'tokens',
    hasTimestamps: true
});

module.exports = bookshelf.model('Token', Token);
