

module.exports = (request, reply) => {

    const data = {
        message: 'Update declaration: ' + request.params.id
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
