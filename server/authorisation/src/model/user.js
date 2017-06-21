import Bookshelf from '../bookshelf';
import Roles from './roles';

const User = Bookshelf.Model.extend({
    tableName: 'users',
    roles: function () {

        return this.hasMany(Roles);
    },
    hasTimestamps: true
});

module.exports = Bookshelf.model('User', User);
