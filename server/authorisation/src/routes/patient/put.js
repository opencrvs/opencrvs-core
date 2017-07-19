/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 11:35:48
 */

const Boom = require('boom');
const Patient = require('../../model/patient');

module.exports = (request, reply) => {



    Patient
        .where('id', request.params.id)
        .fetch()
        .then((patient) => {

            patient
                .save( JSON.parse(request.payload))
                .then((updated) => {

                    const data = {
                        message: 'Patient updated',
                        updated
                    };
                    reply(data)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on patient ' + err));
            }
        });

};
