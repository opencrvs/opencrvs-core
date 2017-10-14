/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:20 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 12:13:09
 */
const Boom = require('boom');
const Declaration = require('../../model/declaration');

module.exports = (request, reply) => {

    const roleType = request.params.roleType;
    let suffix = '';
    if (request.params.context){
        suffix = '-' + request.params.context;
    }
    let declarationType = null;
    switch (roleType) {
        case 'field officer':
            declarationType = 'notified' + suffix;
            break;
        case 'certification clerk':
            declarationType = 'validated' + suffix;
            break;
        case 'registrar':
            declarationType = 'declared' + suffix;
            break;
    }

    Declaration
        .where('status', declarationType)
        .fetchAll({ withRelated:['documents', 'locations', 'informant'] })
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
