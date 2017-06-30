import bookshelf from '../bookshelf';

const Claims = bookshelf.Model.extend({
    tableName: 'claims'
});

const User = bookshelf.Model.extend({
    tableName: 'users',
    claims: function () {

        return this.hasMany(Claims, 'user_id');
    },
    hasTimestamps: true
});

module.exports = bookshelf.model('User', User);
