/*
 * @Author: Euan Millar 
 * @Date: 2017-07-16 17:45:21 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-09 10:15:03
 */
/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-16 17:37:39
 */
import * as fs from 'fs';
const Documents = require('../../model/documents');
const Boom = require('boom');
const UPLOAD_PATH = __dirname + '/uploads';
const fileOptions: FileUploaderOption = { dest: `${UPLOAD_PATH}/`, fileFilter: imageFilter };

const imageFilter = function (fileName: string) {
    // accept image only
    if (!fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
        return false;
    }

    return true;
};

module.exports = (request, reply) => {

    console.log('help');
    const data = request.payload;
    const file = data.uploadFile;
    if (!file) {
        reply(Boom.badImplementation('No file: ' + err));
    }

    if (fileOptions.fileFilter && !fileOptions.fileFilter(file.hapi.filename)) {
        reply(Boom.badImplementation('Type not allowed: ' + err));
    }
    const extension = data.name.split('.').pop();
    const newFilename = data.uuid + '.' + extension;
    const path = `${fileOptions.dest}${newFilename}`;
    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {

        file.on('error', (err) => {

            reply(Boom.badImplementation('Promise file error 1: ' + err));
        });

        file.pipe(fileStream);

        file.on('end', (err) => {

            if (err){
                reply(Boom.badImplementation('Promise file error 2: ' + err));
            }
            else {

                const dbData =
                {
                    uuid: data.uuid,
                    oldName: data.name,
                    staticFile: newFilename,
                    contentType: data.type,
                    declaration_id: data.declaration_id
                };
                new Documents(dbData)
                    .save()
                    .then((documents) => {


                        const responseData = {
                            message: 'Documents success',
                            documents
                        };
                        reply(responseData)
                            .header('Authorization', request.headers.authorization);
                    })
                    .catch((err) => {

                        if (err){
                            reply(Boom.badImplementation('terrible implementation on documents ' + err));
                        }
                    });
            }
        });
    });

};
