/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:20 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 00:44:08
 */
const Boom = require('boom');
const Patient = require('../../model/patient');

module.exports = (request, reply) => {

    Patient
        .where('id', request.params.id)
        .fetch({ withRelated:['address', 'telecom', 'extra'] })
        .then((patient) => {

            if (!patient) {
                reply(Boom.badRequest('No patient available.'));
            }
            else {
                const data = {
                    message: 'Patient success',
                    patient
                };
                reply(data)
                    .header('Authorization', request.headers.authorization);
            }
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on patient ' + err));
            }
        });
};
