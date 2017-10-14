/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:42 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 11:31:13
 */
import bookshelf from '../bookshelf';

const Notifications = bookshelf.Model.extend({
    tableName: 'notifications'
});

module.exports = bookshelf.model('Notifications', Notifications);
