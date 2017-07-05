/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:14:42 
 */
import bookshelf from '../bookshelf';

const Token = bookshelf.Model.extend({
    tableName: 'tokens',
    hasTimestamps: true
});

module.exports = bookshelf.model('Token', Token);
