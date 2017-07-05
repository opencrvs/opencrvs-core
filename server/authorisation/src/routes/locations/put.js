/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:17:15
 */

const Boom = require('boom');
const Locations = require('../../model/locations');

module.exports = (request, reply) => {



    Locations
        .where('id', request.params.id)
        .fetch()
        .then((locations) => {

            locations
                .save( JSON.parse(request.payload.data))
                .then((updated) => {

                    const data = {
                        message: 'Locations updated',
                        updated
                    };
                    reply(data)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on locations ' + err));
            }
        });

};
