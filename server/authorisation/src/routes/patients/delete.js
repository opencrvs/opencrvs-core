/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:23 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 12:31:02
 */


module.exports = (request, reply) => {

    const data = {
        message: 'Delete patient: ' + request.params.id
    };
    reply(data)
        .header('Authorization', request.headers.authorization);
};
