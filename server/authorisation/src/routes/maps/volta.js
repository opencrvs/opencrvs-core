
const Maps = require('./maps/ghana/volta.json');

module.exports = (request, reply) => {

    reply(Maps).header('Authorization', request.headers.authorization);

};
