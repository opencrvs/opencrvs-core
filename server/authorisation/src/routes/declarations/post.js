/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:12 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:14:12 
 */


module.exports = (request, reply) => {

    const data = {
        message: 'Post declaration'
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
