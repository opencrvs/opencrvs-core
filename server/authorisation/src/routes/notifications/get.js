/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:20 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 11:38:10
 */
const Boom = require('boom');
const Notifications = require('../../model/notifications');

module.exports = (request, reply) => {

    Notifications
        .fetchAll()
        .then((notification) => {

            if (!notification) {
                reply(Boom.badRequest('No notifications available.'));
            }
            else {
                const data = {
                    message: 'Notifications success',
                    notification
                };
                reply(data)
                    .header('Authorization', request.headers.authorization);
            }
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on notifications ' + err));
            }
        });
};
