/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-18 22:45:28
 */

const Boom = require('boom');
const Declaration = require('../../model/declaration');

module.exports = (request, reply) => {

    new Declaration(JSON.parse(request.payload.data))
        .save()
        .then((declaration) => {

            const data = {
                message: 'declaration success',
                declaration
            };
            reply(data)
                .header('Authorization', request.headers.authorization);
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on declaration ' + err));
            }
        });

};
