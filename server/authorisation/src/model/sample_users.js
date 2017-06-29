const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync();
const lindaHash = bcrypt.hashSync('2675KC2903tD80E', salt);
const anninaHash = bcrypt.hashSync('4WM88f5Jm0OB94M', salt);
const edHash = bcrypt.hashSync('plan2017', salt);
const carlHash = bcrypt.hashSync('3VV4m89F2e4cZpc', salt);
const euanHash = bcrypt.hashSync('4x11dFcm10h7h0a', salt);
const ryanHash = bcrypt.hashSync('M6ksxscibnWeNqW', salt);
const users = [
  {
      email: 'linda@jembi.org', 
      username: 'lindataylor',
      password: lindaHash,
      role: 'validator',
      claims: [
          {
              claim: 'post:verifyCredentials'
          },
          {
              claim: 'post:login'
          },
          {
              claim: 'post:declaration'
          },
          {
              claim: 'store:image'
          },
          {
              claim: 'notification:search'
          }]
  },
  {
      email: 'Annina.Wersun@plan-international.org', 
      username: 'anninawersun',
      password: anninaHash,
      role: 'registrar',
      claims: [
          {
              claim: 'post:verifyCredentials'
          },
          {
              claim: 'post:login'
          },
          {
              claim: 'post:declaration'
          },
          {
              claim: 'store:image'
          },
          {
              claim: 'notification:search'
          }]
  },
  {
      email: 'edward.duffus@plan-international.org', 
      username: 'edduffus',
      password: edHash,
      role: 'admin',
      claims: [
          {
              claim: 'post:verifyCredentials'
          },
          {
              claim: 'post:login'
          },
          {
              claim: 'post:declaration'
          },
          {
              claim: 'store:image'
          },
          {
              claim: 'notification:search'
          }]
  },
  {
      email: 'carl@jembi.org', 
      username: 'carlfourie',
      password: carlHash,
      role: 'manager',
      claims: [
          {
              claim: 'post:verifyCredentials'
          },
          {
              claim: 'post:login'
          },
          {
              claim: 'post:declaration'
          },
          {
              claim: 'store:image'
          },
          {
              claim: 'notification:search'
          }]
  },
  {
      email: 'euan@yumeteki.io', 
      username: 'euanmillar',
      password: euanHash,
      role: 'clerk',
      claims: [
          {
              claim: 'post:verifyCredentials'
          },
          {
              claim: 'post:login'
          },
          {
              claim: 'post:notification'
          }]
  },
  {
      email: 'ryan@jembi.org', 
      username: 'ryancrichton',
      password: ryanHash,
      role: 'admin',
      claims: [
          {
              claim: 'post:verifyCredentials'
          },
          {
              claim: 'post:login'
          },
          {
              claim: 'post:declaration'
          },
          {
              claim: 'store:image'
          },
          {
              claim: 'notification:search'
          }]
  }
];

module.exports = users;