

module.exports = (request, reply) => {

    const data = {
        message: 'Post declaration'
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
