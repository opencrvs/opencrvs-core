/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 07:19:59
 */

const Boom = require('boom');
const Extra = require('../../model/extra');

module.exports = (request, reply) => {



    Extra
        .where('id', request.params.id)
        .fetch()
        .then((extra) => {

            extra
                .save(request.payload)
                .then((updated) => {

                    const responseData = {
                        message: 'Extra updated',
                        updated
                    };
                    reply(responseData)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on extra ' + err));
            }
        });

};
