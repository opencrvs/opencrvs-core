/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:55 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-16 11:59:21
 */
// App Connections

const internals = {
    connections: [
        {
            port: 4000,
            routes: {
                cors: true
            },
            labels: ['api']
        }
    ]
};

module.exports = internals.connections;
