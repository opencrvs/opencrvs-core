
/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 12:24:28
 */

const Boom = require('boom');
const Documents = require('../../model/documents');
const Fs = require('fs.promised');
const FILE_PATH = __dirname + '/uploads/';

module.exports = (request, reply) => {

    const data = request.payload;
    const staticFile = data.staticFile;
    new Documents({ id:parseInt(request.params.id) }).destroy({ require: true })
        .then(() => Fs.unlink(FILE_PATH + staticFile))
        .then(() => {

            const responseData = {
                message: 'Documents destroyed'
            };
            reply(responseData)
                .header('Authorization', request.headers.authorization);
        }).catch((err) => {

            reply(Boom.badImplementation('Cant delete document ' + err));

        }).catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on documents ' + err));
            }
        });

};
