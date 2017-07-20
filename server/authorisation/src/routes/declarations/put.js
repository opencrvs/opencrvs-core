/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 11:33:29
 */

const Boom = require('boom');
const Declaration = require('../../model/declaration');

module.exports = (request, reply) => {

    Declaration
        .where('id', request.params.id)
        .fetch()
        .then((declaration) => {

            declaration
                .save(request.payload)
                .then((updated) => {

                    const responseData = {
                        message: 'Declaration updated',
                        updated
                    };
                    reply(responseData)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on declaration ' + err));
            }
        });

};
