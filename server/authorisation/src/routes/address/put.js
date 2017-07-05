/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 13:55:44
 */

const Boom = require('boom');
const Address = require('../../model/address');

module.exports = (request, reply) => {



    Address
        .where('id', request.params.id)
        .fetch()
        .then((address) => {

            address
                .save( JSON.parse(request.payload.data))
                .then((updated) => {

                    const data = {
                        message: 'Address updated',
                        updated
                    };
                    reply(data)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on address ' + err));
            }
        });

};
