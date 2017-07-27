/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:21:35
 */

const Boom = require('boom');
const Informant = require('../../model/informant');

module.exports = (request, reply) => {

    new Informant(request.payload)
        .save()
        .then((informant) => {

            const responseData = {
                message: 'Informant success',
                informant
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on informant ' + err));
            }
        });

};
