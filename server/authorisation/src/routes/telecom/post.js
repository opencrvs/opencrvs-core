/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 07:19:20
 */

const Boom = require('boom');
const Telecom = require('../../model/telecom');

module.exports = (request, reply) => {

    new Telecom(request.payload)
        .save()
        .then((telecom) => {

            const responseData = {
                message: 'Telecom success',
                telecom
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on telecom ' + err));
            }
        });

};
