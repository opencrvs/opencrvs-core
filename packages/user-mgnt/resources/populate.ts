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
  practitionerId: '9d40b610-7d8f-48f3-b0ec-e4832373f6c4',
  primaryOfficeId: '54538456-fcf6-4276-86ac-122a7eb47703',
  catchmentAreaIds: [
    '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
    '98fc6e35-7290-45b8-ac50-78f8075fcac5',
    'b3e9c030-fce7-4b10-8179-9b9951e9d7fc',
    '4422415a-f1b0-47c5-8332-7062294670ca'
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
  mobile: '+8801722222222',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_AGENT',
  type: 'ENTREPENEUR',
  scope: ['validate', 'certify', 'demo'],
  status: 'active',
  practitionerId: '8aa975fa-9e69-4a1b-a0e0-1e4aae27e829',
  primaryOfficeId: '54538456-fcf6-4276-86ac-122a7eb47703',
  catchmentAreaIds: [
    '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
    '98fc6e35-7290-45b8-ac50-78f8075fcac5',
    'b3e9c030-fce7-4b10-8179-9b9951e9d7fc',
    '4422415a-f1b0-47c5-8332-7062294670ca'
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
  practitionerId: 'dd78cad3-26dc-469a-bddb-0b45ae489491',
  primaryOfficeId: '54538456-fcf6-4276-86ac-122a7eb47703',
  catchmentAreaIds: [
    '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
    '98fc6e35-7290-45b8-ac50-78f8075fcac5',
    'b3e9c030-fce7-4b10-8179-9b9951e9d7fc',
    '4422415a-f1b0-47c5-8332-7062294670ca'
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
  practitionerId: '19371bee-66b5-4f2e-84d6-96c35a536a3f',
  primaryOfficeId: '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
  catchmentAreaIds: ['98fc6e35-7290-45b8-ac50-78f8075fcac5'],
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
  practitionerId: 'ad95868b-4c3f-4afb-9e90-e8ca93584fab',
  primaryOfficeId: '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
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
  practitionerId: '71d9c66e-b60c-417f-af9f-7e76d026287f',
  primaryOfficeId: '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
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
  practitionerId: '255744d9-0822-44f9-9e50-3c00966095cf',
  primaryOfficeId: '54538456-fcf6-4276-86ac-122a7eb47703',
  catchmentAreaIds: [
    '319b0d8f-e330-45b8-8bd5-863a234d4cc5',
    '98fc6e35-7290-45b8-ac50-78f8075fcac5',
    'b3e9c030-fce7-4b10-8179-9b9951e9d7fc',
    '4422415a-f1b0-47c5-8332-7062294670ca'
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
