
const Reports = require('./reports.json');

module.exports = (request, reply) => {

    reply(Reports).header('Authorization', request.headers.authorization);

};
