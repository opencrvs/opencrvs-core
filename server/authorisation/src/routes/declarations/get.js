

module.exports = (request, reply) => {

    const data = {
        message: 'Get declarations'
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
