/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 11:35:55
 */

const Boom = require('boom');
const Patient = require('../../model/patient');

module.exports = (request, reply) => {

    new Patient(JSON.parse(request.payload))
        .save()
        .then((patient) => {

            const data = {
                message: 'patient success',
                patient
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on patient ' + err));
            }
        });

};
