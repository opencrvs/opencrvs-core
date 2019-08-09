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
  practitionerId: 'af1b5a41-8f74-40dd-869c-a1326d956974',
  primaryOfficeId:
    '3009e53d-cc73-4cf3-9a63-08f7ed14b7dc' /* TODO: when office details arrive change to office id - currently set to union id */,
  catchmentAreaIds: [
    '9f3fbeaa-34a8-47bd-9a03-f1bf7f0f7896', // should be a division
    'f3a7bb32-f7dd-4694-8cb7-eb24040bf283', // should be a district child of the above division
    'bac28dfe-18c4-489f-af87-5ece950e2695', // should be an upazila child of the above district
    '3009e53d-cc73-4cf3-9a63-08f7ed14b7dc' // should be a union child of the above upazila
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
  practitionerId: '8335abe5-e669-4eb6-93c9-24fc03ede6aa',
  primaryOfficeId: 'd2e438fb-c547-4d5f-ad0c-6bcd8ac6d3e8',
  catchmentAreaIds: [
    '9f3fbeaa-34a8-47bd-9a03-f1bf7f0f7896',
    '74d75fdf-414f-46ff-9cbd-5ac72b5c286a',
    '6d090bd9-86c1-4fa0-b25a-c374fc82fff7',
    'd2e438fb-c547-4d5f-ad0c-6bcd8ac6d3e8'
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
  practitionerId: '5ca9c765-f695-43da-bf33-e4c1614e5b16',
  primaryOfficeId: '3009e53d-cc73-4cf3-9a63-08f7ed14b7dc',
  catchmentAreaIds: [
    '9f3fbeaa-34a8-47bd-9a03-f1bf7f0f7896',
    'f3a7bb32-f7dd-4694-8cb7-eb24040bf283',
    'bac28dfe-18c4-489f-af87-5ece950e2695',
    '3009e53d-cc73-4cf3-9a63-08f7ed14b7dc'
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
  practitionerId: '07170456-dacb-418c-a75a-5b4b9484ec68',
  primaryOfficeId: 'f3a7bb32-f7dd-4694-8cb7-eb24040bf283',
  catchmentAreaIds: ['f3a7bb32-f7dd-4694-8cb7-eb24040bf283'],
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
  practitionerId: '5de25d91-ec59-4ed0-bf96-92421cb520a3',
  primaryOfficeId: '9f3fbeaa-34a8-47bd-9a03-f1bf7f0f7896',
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
  practitionerId: '9a1d0751-3e78-43ad-9c41-38d4574b6cfa',
  primaryOfficeId: '9f3fbeaa-34a8-47bd-9a03-f1bf7f0f7896',
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
  practitionerId: 'c15a2bed-e79d-4fba-a4a4-c3fa0ed600ab',
  primaryOfficeId: '3009e53d-cc73-4cf3-9a63-08f7ed14b7dc',
  catchmentAreaIds: [
    '9f3fbeaa-34a8-47bd-9a03-f1bf7f0f7896',
    'f3a7bb32-f7dd-4694-8cb7-eb24040bf283',
    'bac28dfe-18c4-489f-af87-5ece950e2695',
    '3009e53d-cc73-4cf3-9a63-08f7ed14b7dc'
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
