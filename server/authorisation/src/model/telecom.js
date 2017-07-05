/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:14:17
 */
import bookshelf from '../bookshelf';

const Telecom = bookshelf.Model.extend({
    tableName: 'telecom',
    hasTimestamps: true
});

module.exports = bookshelf.model('Telecom', Telecom);
