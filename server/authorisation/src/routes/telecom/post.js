/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:08:44
 */

const Boom = require('boom');
const Telecom = require('../../model/telecom');

module.exports = (request, reply) => {

    new Telecom(JSON.parse(request.payload.data))
        .save()
        .then((telecom) => {

            const data = {
                message: 'Telecom success',
                telecom
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on telecom ' + err));
            }
        });

};
