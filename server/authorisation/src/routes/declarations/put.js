/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:08 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:14:08 
 */


module.exports = (request, reply) => {

    const data = {
        message: 'Update declaration: ' + request.params.id
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
