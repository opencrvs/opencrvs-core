/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:20 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:22:50
 */
const Boom = require('boom');
const Declaration = require('../../model/declaration');

module.exports = (request, reply) => {

    Declaration.fetchAll({ withRelated:['documents', 'locations', 'informant'] })
        .then((declaration) => {

            if (!declaration) {
                reply(Boom.badRequest('No declarations available.'));
            }
            else {
                const data = {
                    message: 'Declarations success',
                    declaration
                };
                reply(data)
                    .header('Authorization', request.headers.authorization);
            }
        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on declaration ' + err));
            }
        });
};
