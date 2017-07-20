/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 11:36:57
 */

const Boom = require('boom');
const Locations = require('../../model/locations');

module.exports = (request, reply) => {

    new Locations(request.payload)
        .save()
        .then((locations) => {

            const responseData = {
                message: 'Locations success',
                locations
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on locations ' + err));
            }
        });

};
