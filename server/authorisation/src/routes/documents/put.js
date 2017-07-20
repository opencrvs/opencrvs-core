/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 23:49:05
 */

const Boom = require('boom');
const Documents = require('../../model/documents');

module.exports = (request, reply) => {



    Documents
        .where('id', request.params.id)
        .fetch()
        .then((documents) => {

            documents
                .save(request.payload)
                .then((updated) => {

                    const responseData = {
                        message: 'Documents updated',
                        updated
                    };
                    reply(responseData)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on documents ' + err));
            }
        });

};
