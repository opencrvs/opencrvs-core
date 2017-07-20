/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 11:37:12
 */

const Boom = require('boom');
const Locations = require('../../model/locations');

module.exports = (request, reply) => {



    Locations
        .where('id', request.params.id)
        .fetch()
        .then((locations) => {

            locations
                .save( request.payload)
                .then((updated) => {

                    const responseData = {
                        message: 'Locations updated',
                        updated
                    };
                    reply(responseData)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on locations ' + err));
            }
        });

};
