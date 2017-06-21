// App Manifest

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

exports.get = function (key) {

    return internals.store.get(key, internals.criteria);
};

exports.meta = function (key) {

    return internals.store.meta(key, internals.criteria);
};
