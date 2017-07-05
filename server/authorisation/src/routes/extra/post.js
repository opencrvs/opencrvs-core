/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:13:27
 */

const Boom = require('boom');
const Extra = require('../../model/extra');

module.exports = (request, reply) => {

    new Extra(JSON.parse(request.payload.data))
        .save()
        .then((extra) => {

            const data = {
                message: 'Extra success',
                extra
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on extra ' + err));
            }
        });

};
