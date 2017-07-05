/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:51 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:15:51 
 */
// App Manifest

const Confidence = require('confidence');
const Registrations = require('./registrations');
const Connections = require('./connections');

const internals = {
    criteria: {
        env: process.env.NODE_ENV
    }
};

internals.manifest = {
    $meta: 'App manifest document',
    server: {
        app: {
            slogan: 'OpenCRVS JWT API Gateway'
        }
    },
    connections: Connections,
    registrations: Registrations
};

internals.store = new Confidence.Store(internals.manifest);

exports.get = function (key) {

    return internals.store.get(key, internals.criteria);
};

exports.meta = function (key) {

    return internals.store.meta(key, internals.criteria);
};
