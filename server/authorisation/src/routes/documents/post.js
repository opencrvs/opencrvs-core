/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:20:51
 */

const Boom = require('boom');
const Documents = require('../../model/documents');

module.exports = (request, reply) => {

    new Documents(JSON.parse(request.payload.data))
        .save()
        .then((documents) => {

            const data = {
                message: 'Documents success',
                documents
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on documents ' + err));
            }
        });

};
