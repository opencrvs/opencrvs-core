/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 13:26:55
 */

const Boom = require('boom');
const Patient = require('../../model/patient');

module.exports = (request, reply) => {

    Patient
        .where('id', request.params.id)
        .fetch()
        .then((patient) => {

            patient.destroy().then(() => {

                const responseData = { message: 'Patient deleted' };
                reply(responseData).header('Authorization', request.headers.authorization);
            });

        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on patient ' + err));
            }
        });

};
