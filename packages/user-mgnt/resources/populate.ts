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

const registrationClerk = new User({
  name: [
    {
      use: 'en',
      given: ['Rabindranath'],
      family: 'Tagore'
    }
  ],
  username: 'robi.tagore',
  email: 'test@test.org',
  mobile: '+8801722222222',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_CLERK',
  type: 'ENTREPENEUR',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '1c1318b7-c17b-4f16-a622-12eac6c74f36',
  primaryOfficeId: '128a657e-851d-4a48-b0f8-cd2d14c5aa09',
  catchmentAreaIds: [
    'd2898740-42e4-4680-b5a7-2f0a12a15199',
    '6555e1d3-36ec-413b-9599-eb96676ac6fd',
    '4cfda6cf-e194-49f4-9574-c1bb5d26865d',
    '128a657e-851d-4a48-b0f8-cd2d14c5aa09'
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
  practitionerId: '862519b7-552f-4512-946f-35ecde896c50',
  primaryOfficeId: '0627c48a-c721-4ff9-bc6e-1fba59a2332a',
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
  practitionerId: '3bebd40a-3a40-4c5d-ad41-a949778bc368',
  primaryOfficeId: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
  catchmentAreaIds: [],
  securityQuestionAnswers: []
})

const fieldAgent2 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Ariful'],
      family: 'Islam'
    }
  ],
  username: 'ariful.islam',
  email: 'test@test.org',
  mobile: '+8801740012994',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  type: 'HOSPITAL',
  scope: ['declare', 'demo'],
  status: 'active',
  practitionerId: 'f968bdb3-5f56-4849-95a3-32442a9aa91d',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const fieldAgent3 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Ashraful'],
      family: 'Alam'
    }
  ],
  username: 'ashraful.alam',
  email: 'test@test.org',
  mobile: '+8801723438160',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  type: 'CHA',
  scope: ['declare', 'demo'],
  status: 'active',
  practitionerId: 'e5d552d3-dff6-497d-9b38-e2679ac3b246',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const registrationClerk2 = new User({
  name: [
    {
      use: 'en',
      given: ['Lovely'],
      family: 'Khatun'
    }
  ],
  username: 'lovely.khatun',
  email: 'test@test.org',
  mobile: '+8801797602268',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_CLERK',
  type: 'DATA_ENTRY_CLERK',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '2c008cb1-04e6-4c4a-ab1c-a327a3db1676',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const registrationClerk3 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Seikh'],
      family: 'Farid'
    }
  ],
  username: 'seikh.farid',
  email: 'test@test.org',
  mobile: '+8801767332319',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_CLERK',
  type: 'DATA_ENTRY_CLERK',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: 'cd9b2489-6259-4e86-a27c-a9e948886c03',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const localRegistrar2 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Jahangir'],
      family: 'Alam'
    }
  ],
  username: 'jahangir.alam',
  email: 'test@test.org',
  mobile: '+8801722038795',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  type: 'CHAIRMAN',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '446e8b50-dc43-4064-af58-4048adead33b',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const localRegistrar3 = new User({
  name: [
    {
      use: 'en',
      given: ['A.K.M Mahmudur'],
      family: 'Rohman'
    }
  ],
  username: 'mahmudur.rohman',
  email: 'test@test.org',
  mobile: '+8801712142796',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  type: 'CHAIRMAN',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '8c61ac74-e46c-429a-80fe-2e027c0af1a1',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const fieldAgent4 = new User({
  name: [
    {
      use: 'en',
      given: ['Abdullah Al'],
      family: 'Arafat'
    }
  ],
  username: 'abdullah.arafat',
  email: 'test@test.org',
  mobile: '+8801711081454',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  type: 'CHA',
  scope: ['declare', 'demo'],
  status: 'active',
  practitionerId: 'd01c0e86-dfbf-45bb-8ff8-1d29b79910ae',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
  securityQuestionAnswers: []
})

const registrationClerk4 = new User({
  name: [
    {
      use: 'en',
      given: ['Neelima'],
      family: 'Yasmeen'
    }
  ],
  username: 'neelima.yasmeen',
  email: 'test@test.org',
  mobile: '+8801610005011',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  type: 'CHAIRMAN',
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  practitionerId: '3425c8df-6a95-44da-a616-28c7333a938c',
  primaryOfficeId: '1c82a6e0-f06b-4023-918a-0f57c0bae17f',
  catchmentAreaIds: [
    '7060bc1f-a593-46c4-9bce-9e0f047b315d',
    '91657590-6306-43bd-87e3-b55fa3c7ae54',
    '3452a035-a699-41de-a3b0-4d7b5a0660d3',
    '1c82a6e0-f06b-4023-918a-0f57c0bae17f'
  ],
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
  primaryOfficeId: '0627c48a-c721-4ff9-bc6e-1fba59a2332a',
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
  fieldAgent2,
  fieldAgent3,
  fieldAgent4,
  registrationClerk,
  registrationClerk2,
  registrationClerk3,
  registrationClerk4,
  localRegistrar,
  localRegistrar2,
  localRegistrar3,
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
  value: 'REGISTRATION_CLERK',
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
