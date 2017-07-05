/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:14:37
 */
import bookshelf from '../bookshelf';

const Extra = bookshelf.Model.extend({
    tableName: 'extra',
    hasTimestamps: true
});

module.exports = bookshelf.model('Extra', Extra);
