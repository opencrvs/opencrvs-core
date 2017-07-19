/*
 * @Author: Euan Millar 
 * @Date: 2017-07-16 17:45:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-16 17:48:21
 */

import * as fs from 'fs';
const Boom = require('boom');
const Documents = require('../../model/documents');

const imageFilter = function (fileName: string) {
    // accept image only
    if (!fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
        return false;
    }

    return true;
};

const uploader = function (file: any, data, options: FileUploaderOption, reply) {
  
    if (!file) {
        reply(Boom.badImplementation('No file: ' + err));
    }

    if (options.fileFilter && !options.fileFilter(file.hapi.filename)) {
        reply(Boom.badImplementation('Type not allowed: ' + err));
    }
    const extension = data.name.split('.').pop();
    const newFilename = data.uuid + '.' + extension;
    const path = `${options.dest}${newFilename}`;
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
                    staticFile: newFilename,
                    content: fs.readFileSync(path),
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

export { imageFilter, uploader };
