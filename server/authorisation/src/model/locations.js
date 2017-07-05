/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:17:45
 */
import bookshelf from '../bookshelf';

const Locations = bookshelf.Model.extend({
    tableName: 'locations'
});

module.exports = bookshelf.model('Locations', Locations);
