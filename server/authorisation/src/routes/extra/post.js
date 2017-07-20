/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 07:19:46
 */

const Boom = require('boom');
const Extra = require('../../model/extra');

module.exports = (request, reply) => {

    new Extra(request.payload)
        .save()
        .then((extra) => {

            const responseData = {
                message: 'Extra success',
                extra
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on extra ' + err));
            }
        });

};
