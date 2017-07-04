

module.exports = (request, reply) => {

    const data = {
        message: 'Delete declaration: ' + request.params.id
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
