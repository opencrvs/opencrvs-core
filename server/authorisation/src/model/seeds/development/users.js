
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
    }
  )
    .then(function(userIds){
      return knex('claims')
        .insert(
        {
          claims: user.claims,
          user_id: userIds[0],
        }
      );
    });
}