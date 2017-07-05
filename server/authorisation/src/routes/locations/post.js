/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:17:02
 */

const Boom = require('boom');
const Locations = require('../../model/locations');

module.exports = (request, reply) => {

    new Locations(JSON.parse(request.payload.data))
        .save()
        .then((locations) => {

            const data = {
                message: 'Locations success',
                locations
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on locations ' + err));
            }
        });

};
