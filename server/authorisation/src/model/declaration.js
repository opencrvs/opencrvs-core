/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:45 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:24:04
 */
import bookshelf from '../bookshelf';

const Locations = bookshelf.Model.extend({
    tableName: 'locations'
});

const Informant = bookshelf.Model.extend({
    tableName: 'informant'
});

const Documents = bookshelf.Model.extend({
    tableName: 'documents'
});

const Declaration = bookshelf.Model.extend({
    tableName: 'declarations',
    documents: function () {

        return this.hasMany(Documents, 'declaration_id');
    },
    locations: function () {

        return this.hasMany(Locations, 'declaration_id');
    },
    informant: function () {

        return this.hasMany(Informant, 'declaration_id');
    },
    hasTimestamps: true
});

module.exports = bookshelf.model('Declaration', Declaration);
