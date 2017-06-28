// App Connections

const internals = {
    connections: [
        {
            port: 3000,
            labels: ['web-app']
        },
        {
            port: 6000,
            labels: ['api']
        }
    ]
};

module.exports = internals.connections;
