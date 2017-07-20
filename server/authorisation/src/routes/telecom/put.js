/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 07:18:51
 */

const Boom = require('boom');
const Telecom = require('../../model/telecom');

module.exports = (request, reply) => {



    Telecom
        .where('id', request.params.id)
        .fetch()
        .then((telecom) => {

            telecom
                .save(request.payload)
                .then((updated) => {

                    const responseData = {
                        message: 'Telecom updated',
                        updated
                    };
                    reply(responseData)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on telecom ' + err));
            }
        });

};
