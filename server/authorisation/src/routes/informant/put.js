/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:21:01
 */

const Boom = require('boom');
const Informant = require('../../model/informant');

module.exports = (request, reply) => {



    Informant
        .where('id', request.params.id)
        .fetch()
        .then((informant) => {

            informant
                .save( request.payload)
                .then((updated) => {

                    const responseData = {
                        message: 'informant updated',
                        updated
                    };
                    reply(responseData)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on Informant ' + err));
            }
        });

};
