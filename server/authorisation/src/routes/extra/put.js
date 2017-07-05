/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 14:13:43
 */

const Boom = require('boom');
const Extra = require('../../model/extra');

module.exports = (request, reply) => {



    Extra
        .where('id', request.params.id)
        .fetch()
        .then((extra) => {

            extra
                .save( JSON.parse(request.payload.data))
                .then((updated) => {

                    const data = {
                        message: 'Extra updated',
                        updated
                    };
                    reply(data)
                        .header('Authorization', request.headers.authorization);
                });
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on extra ' + err));
            }
        });

};
