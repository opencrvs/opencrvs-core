import * as mongoose from 'mongoose'

import User from '../src/model/user'
import Role from '../src/model/role'
import { generateSaltedHash } from '../src/utils/hash'
import { MONGO_URL } from '../src/constants'
mongoose.connect(MONGO_URL)

const pass = generateSaltedHash('test')

const fieldAgent = new User({
  name: [
    {
      use: 'en',
      given: ['Sakib Al'],
      family: 'Hasan'
    }
  ],
  username: 'sakibal.hasan',
  email: 'test@test.org',
  mobile: '+8801711111111',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  type: 'CHA',
  scope: ['declare', 'demo'],
  status: 'active',
  practitionerId: '8807e4d8-1440-4507-a882-5891ded9bbd5',
  primaryOfficeId:
    'a6473e18-f5ec-467e-9a33-a6a6754c7ee7' /* TODO: when office details arrive change to office id - currently set to union id */,
  catchmentAreaIds: [
    'b272a5dd-7e2e-46db-9eeb-b3b3c915a547', // should be a division
    '8503cefe-24b2-46fb-afd9-efff42c67c1a', // should be a district child of the above division
    '29307288-24df-43c9-abb3-3f457e27520b', // should be an upazila child of the above district
    '0197c3f0-6eba-45a8-a284-2602e603e205' // should be a union child of the above upazila
  ],
  securityQuestionAnswers: []
})

const registrationAgent = new User({
  name: [
    {
      use: 'en',
      given: ['Tamim'],
      family: 'Iqbal'
    }
  ],
  username: 'tamim.iqbal',
  email: 'test@test.org',
  mobile: '+8801721111111',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_AGENT',
  type: 'ENTREPENEUR',
  scope: ['validate', 'certify', 'demo'],
  status: 'active',
  practitionerId: '2aa2d4e0-5804-41b1-8ce4-12fb113970b1',
  primaryOfficeId: '51993c23-560b-465b-a7ad-5fd7b9f9fd5a',
  catchmentAreaIds: [
    'b272a5dd-7e2e-46db-9eeb-b3b3c915a547',
    'bf795ccf-feb8-47c8-93e9-323e0d60821e',
    '4464fb0a-1917-4c3c-ae63-54c318110f97',
    'e71c01b8-88c6-4efb-84e9-73f9091e27d5'
  ],
  securityQuestionAnswers: []
})

const localRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Mohammad'],
      family: 'Ashraful'
    }
  ],
  username: 'mohammad.ashraful',
  email: 'test@test.org',
  mobile: '+8801733333333',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  type: 'CHAIRMAN',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: 'b61f0345-3759-433e-a2e2-2dd3a0e1bdf9',
  primaryOfficeId: 'a6473e18-f5ec-467e-9a33-a6a6754c7ee7',
  catchmentAreaIds: [
    'b272a5dd-7e2e-46db-9eeb-b3b3c915a547',
    '8503cefe-24b2-46fb-afd9-efff42c67c1a',
    '29307288-24df-43c9-abb3-3f457e27520b',
    '0197c3f0-6eba-45a8-a284-2602e603e205'
  ],
  securityQuestionAnswers: []
})

const districtRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Muhammad Abdul'],
      family: 'Muid Khan'
    }
  ],
  username: 'muid.khan',
  email: 'test@test.org',
  mobile: '+8801744444444',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'DISTRICT_REGISTRAR',
  type: 'MAYOR',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '60cd7bac-68c9-4474-a0a6-a11cb08f4f60',
  primaryOfficeId: 'b272a5dd-7e2e-46db-9eeb-b3b3c915a547',
  catchmentAreaIds: ['8503cefe-24b2-46fb-afd9-efff42c67c1a'],
  securityQuestionAnswers: []
})

const stateRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Nasreen Pervin'],
      family: 'Huq'
    }
  ],
  username: 'nasreen.pervin',
  email: 'test@test.org',
  mobile: '+8801755555555',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'STATE_REGISTRAR',
  type: 'MAYOR',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '0864ece0-a3d7-4857-85d7-a098676f70ec',
  primaryOfficeId: 'b272a5dd-7e2e-46db-9eeb-b3b3c915a547',
  catchmentAreaIds: [],
  securityQuestionAnswers: []
})

const nationalRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Mohamed Abu'],
      family: 'Abdullah'
    }
  ],
  username: 'mohamed.abu',
  email: 'test@test.org',
  mobile: '+8801766666666',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'NATIONAL_REGISTRAR',
  type: 'SECRETARY',
  scope: ['register', 'performance', 'certify', 'config', 'teams', 'demo'],
  status: 'active',
  practitionerId: '10371c7f-fc1a-4390-92f0-03d6dd47e3cd',
  primaryOfficeId: 'b272a5dd-7e2e-46db-9eeb-b3b3c915a547',
  catchmentAreaIds: [],
  securityQuestionAnswers: []
})

const sysAdmin = new User({
  name: [
    {
      use: 'en',
      given: ['Sahriar'],
      family: 'Nafis'
    }
  ],
  username: 'shahriar.nafis',
  email: 'test@test.org',
  mobile: '+8801721111111',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_SYSTEM_ADMIN',
  type: 'LOCAL_SYSTEM_ADMIN',
  scope: ['sysadmin', 'demo'],
  status: 'active',
  practitionerId: '64112dc5-473f-4176-97d7-387162e66a44',
  primaryOfficeId: 'a6473e18-f5ec-467e-9a33-a6a6754c7ee7',
  catchmentAreaIds: [
    'b272a5dd-7e2e-46db-9eeb-b3b3c915a547',
    '8503cefe-24b2-46fb-afd9-efff42c67c1a',
    '29307288-24df-43c9-abb3-3f457e27520b',
    '0197c3f0-6eba-45a8-a284-2602e603e205'
  ],
  securityQuestionAnswers: []
})

const users = [
  fieldAgent,
  registrationAgent,
  localRegistrar,
  districtRegistrar,
  stateRegistrar,
  nationalRegistrar,
  sysAdmin
]
User.collection.insertMany(users)

const fieldAgentRole = new Role({
  title: 'Field Agent',
  value: 'FIELD_AGENT',
  types: ['HOSPITAL', 'CHA'],
  active: true
})

const regitstrationAgentRole = new Role({
  title: 'Registration Agent',
  value: 'REGISTRATION_AGENT',
  types: ['ENTREPENEUR', 'DATA_ENTRY_CLERK'],
  active: true
})

const regitstrarRole = new Role({
  title: 'Registrar',
  value: 'LOCAL_REGISTRAR',
  types: ['SECRETARY', 'CHAIRMAN', 'MAYOR'],
  active: true
})

const sysAdminLocalRole = new Role({
  title: 'System admin (local)',
  value: 'LOCAL_SYSTEM_ADMIN',
  types: ['LOCAL_SYSTEM_ADMIN'],
  active: true
})

const sysAdminNationalRole = new Role({
  title: 'System admin (national)',
  value: 'NATIONAL_SYSTEM_ADMIN',
  types: ['NATIONAL_SYSTEM_ADMIN'],
  active: true
})

const performanceOversightRole = new Role({
  title: 'Performance Oversight',
  value: 'PERFORMANCE_OVERSIGHT',
  types: ['CABINET_DIVISION', 'BBS'],
  active: true
})

const performanceMgntRole = new Role({
  title: 'Performance Management',
  value: 'PERFORMANCE_MANAGEMENT',
  types: ['HEALTH_DIVISION', 'ORG_DIVISION'],
  active: true
})

const roles = [
  fieldAgentRole,
  regitstrationAgentRole,
  regitstrarRole,
  sysAdminLocalRole,
  sysAdminNationalRole,
  performanceOversightRole,
  performanceMgntRole
]

function onInsert(err: any, values: any) {
  if (!err) {
    mongoose.disconnect()
  }
}
Role.collection.insertMany(roles, onInsert)
