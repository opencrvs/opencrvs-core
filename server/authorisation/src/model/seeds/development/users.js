
var users = require('../../sample_users');
exports.seed = function(knex, Promise) {
  var userPromises = [];
  users.forEach(function(user){
    userPromises.push(createUser(knex, user));
  });

  return Promise.all(userPromises);
};

function createUser(knex, user) {
  return knex.table('users')
    .returning('id')
    .insert(
    {
      email: user.email,
      password: user.password, 
      role: user.role,
      username: user.username
    })
    .then(function(userIds){

        var claims = user.claims;
        claims.forEach(function (userClaims) {
            userClaims.user_id = userIds[0];
        });
        return knex('claims').insert(claims);
    });
}
