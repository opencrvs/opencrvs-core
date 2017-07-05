/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:21:05
 */

const Boom = require('boom');
const Documents = require('../../model/documents');

module.exports = (request, reply) => {



    Documents
        .where('id', request.params.id)
        .fetch()
        .then((documents) => {

            documents
                .save( JSON.parse(request.payload.data))
                .then((updated) => {

                    const data = {
                        message: 'Documents updated',
                        updated
                    };
                    reply(data)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on documents ' + err));
            }
        });

};
