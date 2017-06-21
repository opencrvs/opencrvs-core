import Bookshelf from '../bookshelf';

const Roles = Bookshelf.Model.extend({
    tableName: 'roles'
});

module.exports = Bookshelf.model('Roles', Roles);
