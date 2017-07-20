/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 22:16:49
 */

const Boom = require('boom');
const Patient = require('../../model/patient');

module.exports = (request, reply) => {

    new Patient(request.payload)
        .save()
        .then((updated) => {

            const responseData = {
                message: 'patient success',
                updated
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on patient ' + err));
            }
        });

};
