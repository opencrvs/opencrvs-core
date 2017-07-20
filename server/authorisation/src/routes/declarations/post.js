/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 11:32:49
 */

const Boom = require('boom');
const Declaration = require('../../model/declaration');

module.exports = (request, reply) => {

    new Declaration(request.payload)
        .save()
        .then((declaration) => {

            const responseData = {
                message: 'declaration success',
                declaration
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
