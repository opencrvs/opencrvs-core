
const Maps = require('./maps/ghana/ghana.json');

module.exports = (request, reply) => {

    reply(Maps).header('Authorization', request.headers.authorization);

};
