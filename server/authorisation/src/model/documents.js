/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:21:55
 */
import bookshelf from '../bookshelf';

const Documents = bookshelf.Model.extend({
    tableName: 'documents',
    hasTimestamps: true
});

module.exports = bookshelf.model('Documents', Documents);
