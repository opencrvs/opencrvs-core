/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 13:54:29
 */
import bookshelf from '../bookshelf';

const Address = bookshelf.Model.extend({
    tableName: 'address'
});

module.exports = bookshelf.model('Address', Address);
