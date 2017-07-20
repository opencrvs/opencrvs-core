/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 23:00:33
 */

const Boom = require('boom');
const Declaration = require('../../model/declaration');

module.exports = (request, reply) => {

    new Declaration(request.payload)
        .save()
        .then((updated) => {

            const responseData = {
                message: 'declaration success',
                updated
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on declaration ' + err));
            }
        });

};
