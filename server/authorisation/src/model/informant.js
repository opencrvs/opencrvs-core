/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:16:53
 */
import bookshelf from '../bookshelf';

const Informant = bookshelf.Model.extend({
    tableName: 'informant'
});

module.exports = bookshelf.model('Informant', Informant);
