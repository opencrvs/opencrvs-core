/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 07:18:26
 */

const Boom = require('boom');
const Patient = require('../../model/patient');

module.exports = (request, reply) => {

    new Patient(request.payload)
        .save()
        .then((patient) => {

            const responseData = {
                message: 'patient success',
                patient
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
