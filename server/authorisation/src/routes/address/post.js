/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 07:19:04
 */

const Boom = require('boom');
const Address = require('../../model/address');

module.exports = (request, reply) => {

    new Address(request.payload)
        .save()
        .then((address) => {

            const responseData = {
                message: 'Address success',
                address
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on address ' + err));
            }
        });

};
