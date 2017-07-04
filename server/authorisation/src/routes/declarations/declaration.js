// Protected 

module.exports = (request, reply) => {

    const data = {
        message: 'welcome to the protected page'
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
