/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:09:01
 */

const Boom = require('boom');
const Telecom = require('../../model/telecom');

module.exports = (request, reply) => {



    Telecom
        .where('id', request.params.id)
        .fetch()
        .then((telecom) => {

            telecom
                .save( JSON.parse(request.payload.data))
                .then((updated) => {

                    const data = {
                        message: 'Telecom updated',
                        updated
                    };
                    reply(data)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on telecom ' + err));
            }
        });

};
