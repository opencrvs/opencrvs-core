import * as mongoose from 'mongoose'

import User from '../src/model/user'
import Role from '../src/model/role'
import { generateSaltedHash } from '../src/utils/hash'
import { MONGO_URL } from '../src/constants'
mongoose.connect(MONGO_URL)

const dummySignature =
  // tslint:disable-next-line: max-line-length
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAvVBMVEVHcExNerVNerVOerZOe7RMe7NNe7ROe7UAAP9PebVLerRQfLNRebVNfLZJbbZNerROdrFNerZNe7VPerVNgLNOe7VPebZOebZVd7tAgL9MebNVgKpNe7dOe7RVVapKdbVOebZOerVOerZNd7NOebaAgIBNfbhOe7ZOebRJgLZNeLdNerRNe7VQerVOerdVgLhOerFPfbVRea5MfLNVcapNeLZVgL9SdrZOe7VPerVmZsxNe7VNebZPebdMerexCT1cAAAAP3RSTlMAYFZzZhtqaAFnLEAmQgdtDUlZaxRyKjsPBDkGPFUDGGV5mR5pAiugpA41d08wLhIXLRMlCUYMHD5aBVM/SkPScFaPAAAAk0lEQVQY033OBw6CQBAF0L/AFpogzS723nu//7FcNKDExMlkk3mZ/Fngt7bF/FwIb6ccPCJwYGFkoAtocDkfp+BLw/0YZUlyXwO57AjoG7Skz4fVLBhZopFkAAy2NZ+YA27UJVwD4WDpEbcnnFZNwsbbr4HQ7zPE1VcIm8rHHLZpesbudEHVr6+rFUVXmh8olfG3nsyFCOocKThSAAAAAElFTkSuQmCC'

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
  practitionerId: 'd5c2e811-117b-45b2-9056-cd8a2081919c',
  primaryOfficeId:
    '0627c48a-c721-4ff9-bc6e-1fba59a2332a' /* TODO: when office details arrive change to office id - currently set to union id */,
  catchmentAreaIds: [
    'd2898740-42e4-4680-b5a7-2f0a12a15199', // should be a division
    '4af73d73-aa6e-4770-b1d9-4274949e431e', // should be a district child of the above division
    'd757aee6-0691-42d5-92dd-ab731cb640d6', // should be an upazila child of the above district
    '0627c48a-c721-4ff9-bc6e-1fba59a2332a' // should be a union child of the above upazila
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
  practitionerId: '9680f408-8a3f-49f4-ab25-4e0338434c19',
  primaryOfficeId: '0564787d-a849-4190-b2b8-0466f75d4d8c',
  catchmentAreaIds: [
    'd2898740-42e4-4680-b5a7-2f0a12a15199',
    '4af73d73-aa6e-4770-b1d9-4274949e431e',
    'd757aee6-0691-42d5-92dd-ab731cb640d6',
    '0627c48a-c721-4ff9-bc6e-1fba59a2332a'
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
  signature: dummySignature,
  practitionerId: '862519b7-552f-4512-946f-35ecde896c50',
  primaryOfficeId: '0564787d-a849-4190-b2b8-0466f75d4d8c',
  catchmentAreaIds: [
    'd2898740-42e4-4680-b5a7-2f0a12a15199',
    '4af73d73-aa6e-4770-b1d9-4274949e431e',
    'd757aee6-0691-42d5-92dd-ab731cb640d6',
    '0627c48a-c721-4ff9-bc6e-1fba59a2332a'
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
  signature: dummySignature,
  practitionerId: '4e6df67a-ac2c-4bad-8516-6abc0a883e7b',
  primaryOfficeId: '4af73d73-aa6e-4770-b1d9-4274949e431e',
  catchmentAreaIds: ['d2898740-42e4-4680-b5a7-2f0a12a15199'],
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
  signature: dummySignature,
  practitionerId: '39e56f2a-23d5-4e76-ab5d-6f41ec4619db',
  primaryOfficeId: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
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
  signature: dummySignature,
  practitionerId: '3bebd40a-3a40-4c5d-ad41-a949778bc368',
  primaryOfficeId: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
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
  practitionerId: '9680f408-8a3f-49f4-ab25-4e0338434c19',
  primaryOfficeId: '0564787d-a849-4190-b2b8-0466f75d4d8c',
  catchmentAreaIds: [
    'd2898740-42e4-4680-b5a7-2f0a12a15199',
    '4af73d73-aa6e-4770-b1d9-4274949e431e',
    'd757aee6-0691-42d5-92dd-ab731cb640d6',
    '0627c48a-c721-4ff9-bc6e-1fba59a2332a'
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
