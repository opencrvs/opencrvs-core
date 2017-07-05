/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 13:55:17
 */

const Boom = require('boom');
const Address = require('../../model/address');

module.exports = (request, reply) => {

    new Address(JSON.parse(request.payload.data))
        .save()
        .then((address) => {

            const data = {
                message: 'Address success',
                address
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on address ' + err));
            }
        });

};
