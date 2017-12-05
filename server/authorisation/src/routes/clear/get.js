/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 13:26:55
 */

const Boom = require('boom');
const Patient = require('../../model/patient');
const Telecom = require('../../model/telecom');
const Extra = require('../../model/extra');
const Address = require('../../model/address');
const Declarations = require('../../model/declaration');
const Informant = require('../../model/informant');
const Locations = require('../../model/locations');
const Notifications = require('../../model/notifications');
module.exports = (request, reply) => {

    Patient.where('id', '>', 27).destroy()
        .then(() => {

            Telecom.where('id', '>', 27).destroy()
                .then(() => {

                    Extra.where('id', '>', 27).destroy()
                        .then(() => {

                            Address.where('id', '>', 27).destroy()
                                .then(() => {

                                    Declarations.where('id', '>', 6).destroy()
                                        .then(() => {

                                            Informant.where('id', '>', 6).destroy()
                                                .then(() => {

                                                    Locations.where('id', '>', 6).destroy()
                                                        .then(() => {

                                                            Notifications.where('id', '>', 6).destroy()
                                                                .then(() => {

                                                                    const responseData = { message: 'All deleted' };
                                                                    reply(responseData).header('Authorization', request.headers.authorization);

                                                                })
                                                                .catch((err) => {

                                                                    if (err){
                                                                        reply(Boom.badImplementation('terrible implementation on notifications ' + err));
                                                                    }
                                                                });

                                                        })
                                                        .catch((err) => {

                                                            if (err){
                                                                reply(Boom.badImplementation('terrible implementation on locations ' + err));
                                                            }
                                                        });

                                                })
                                                .catch((err) => {

                                                    if (err){
                                                        reply(Boom.badImplementation('terrible implementation on informant ' + err));
                                                    }
                                                });

                                        })
                                        .catch((err) => {

                                            if (err){
                                                reply(Boom.badImplementation('terrible implementation on declarations ' + err));
                                            }
                                        });

                                })
                                .catch((err) => {

                                    if (err){
                                        reply(Boom.badImplementation('terrible implementation on address ' + err));
                                    }
                                });

                        })
                        .catch((err) => {

                            if (err){
                                reply(Boom.badImplementation('terrible implementation on extra ' + err));
                            }
                        });

                })
                .catch((err) => {

                    if (err){
                        reply(Boom.badImplementation('terrible implementation on telecom ' + err));
                    }
                });
            

        })
        .catch((err) => {

            if (err){
                reply(Boom.badImplementation('terrible implementation on patient ' + err));
            }
        });

};

