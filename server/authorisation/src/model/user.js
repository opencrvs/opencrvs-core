/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:38 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:14:38 
 */
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
