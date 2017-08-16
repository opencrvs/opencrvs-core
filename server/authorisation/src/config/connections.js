/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:15:55 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-16 13:46:29
 */
// App Connections

const internals = {
    connections: [
        {
            port: 3000,
            routes: {
                cors: false
            },
            labels: ['api']
        }
    ]
};

module.exports = internals.connections;
