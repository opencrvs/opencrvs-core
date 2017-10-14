/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 11:38:46
 */

const Boom = require('boom');
const Notifications = require('../../model/notifications');

module.exports = (request, reply) => {

    new Notifications(request.payload)
        .save()
        .then((updated) => {

            const responseData = {
                message: 'Notifications success',
                updated
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on notifications ' + err));
            }
        });

};
