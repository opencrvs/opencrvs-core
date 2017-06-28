import Bookshelf from '../bookshelf';

const Role = Bookshelf.Model.extend({
    tableName: 'roles'
});

const User = Bookshelf.Model.extend({
    tableName: 'users',
    roles: function () {

        return this.hasMany(Role, 'user_id');
    },
    hasTimestamps: true
});

module.exports = {
    User
};
