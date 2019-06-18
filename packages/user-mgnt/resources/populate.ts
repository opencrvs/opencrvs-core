import * as mongoose from 'mongoose'

import User from '../src/model/user'
import Role from '../src/model/role'
import { generateSaltedHash } from '../src/utils/password'
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
  email: 'test@test.org',
  mobile: '+8801711111111',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  scope: ['declare', 'demo'],
  practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ]
})

const registrationClerk = new User({
  name: [
    {
      use: 'en',
      given: ['Rabindranath'],
      family: 'Tagore'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801722222222',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_CLERK',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: '8179ec96-7cf3-4e43-a60d-df031c431886',
  primaryOfficeId: 'd8f5e899-0461-4d58-943f-3a980733a8d3',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '9d00135f-c892-4e39-ab87-e02698e1b30e',
    '4b100ad2-ac0d-4970-85df-d4fb8ed79808',
    'b9958fa4-5c6e-4037-9f6a-fbad315344f9'
  ]
})

const localRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Mohammad'],
      family: 'Ashraful'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801733333333',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: '99636b42-72c3-40c2-9c19-947efa728068',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ]
})

const districtRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Muhammad Abdul'],
      family: 'Muid Khan'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801744444444',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'DISTRICT_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: '4522ce59-3742-4989-9159-bea7f45d1d89',
  primaryOfficeId: '95754572-ab6f-407b-b51a-1636cb3d0683',
  catchmentAreaIds: ['b21ce04e-7ccd-4d65-929f-453bc193a736']
})

const stateRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Nasreen Pervin'],
      family: 'Huq'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801755555555',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'STATE_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: '936aec8d-f5bf-48f6-a4fd-d1505010ac82',
  primaryOfficeId: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
  catchmentAreaIds: []
})

const nationalRegistrar = new User({
  name: [
    {
      use: 'en',
      given: ['Mohamed Abu'],
      family: 'Abdullah'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801766666666',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'NATIONAL_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'config', 'teams', 'demo'],
  practitionerId: '636840d9-3e0a-4f9a-86a2-9c0b542c122d',
  primaryOfficeId: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
  catchmentAreaIds: []
})

const fieldAgent2 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Ariful'],
      family: 'Islam'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801740012994',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  scope: ['declare', 'demo'],
  practitionerId: '7c3fe905-dd96-4af7-b442-a952b0feb23d',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const fieldAgent3 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Ashraful'],
      family: 'Alam'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801723438160',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  scope: ['declare', 'demo'],
  practitionerId: '95d758e4-acac-49ec-a6cf-db5a338b29ba',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const registrationClerk2 = new User({
  name: [
    {
      use: 'en',
      given: ['Lovely'],
      family: 'Khatun'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801797602268',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_CLERK',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: 'a6c1e54d-0d3b-4ca8-bd79-06bccdfcf171',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const registrationClerk3 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Seikh'],
      family: 'Farid'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801767332319',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'REGISTRATION_CLERK',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: '5ae8a55a-5e31-4b97-ae53-d5144ad6529f',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const localRegistrar2 = new User({
  name: [
    {
      use: 'en',
      given: ['Md. Jahangir'],
      family: 'Alam'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801722038795',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: 'b5ee7d9b-9de2-4457-b273-9ed4dc0e3e08',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const localRegistrar3 = new User({
  name: [
    {
      use: 'en',
      given: ['A.K.M Mahmudur'],
      family: 'Rohman'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801712142796',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: 'e59724eb-4f93-4dc5-b731-c025290f1415',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const fieldAgent4 = new User({
  name: [
    {
      use: 'en',
      given: ['Abdullah Al'],
      family: 'Arafat'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801711081454',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'FIELD_AGENT',
  scope: ['declare', 'demo'],
  practitionerId: '7d4a6d0d-1d58-4430-8343-91b8e71ceced',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const registrationClerk4 = new User({
  name: [
    {
      use: 'en',
      given: ['Neelima'],
      family: 'Yasmeen'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801610005011',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_REGISTRAR',
  scope: ['register', 'performance', 'certify', 'demo'],
  practitionerId: 'dd480509-cc3e-41b7-8a1c-8e63534660c2',
  primaryOfficeId: '3e7a3524-e0d2-4a5b-959a-845efbe1fca8',
  catchmentAreaIds: [
    '5acd70c7-5040-4e56-a291-1c10ebb9d123',
    '1f5eb576-75e8-4afd-a4f2-4ce1b17be5a4',
    '441c6133-06ca-4a2b-bf23-024347d340c8',
    '74b72216-ae78-4587-b505-b27b3f109e1b'
  ]
})

const sysAdmin = new User({
  name: [
    {
      use: 'en',
      given: ['Sahriar'],
      family: 'Nafis'
    }
  ],
  email: 'test@test.org',
  mobile: '+8801721111111',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'LOCAL_SYSTEM_ADMIN',
  scope: ['sysadmin', 'demo'],
  practitionerId: 'd9cf6968-2b4b-4eda-8ba0-5265d53fdb22',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ]
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
  types: ['Hospital', 'CHA'],
  active: true
})

const regitstrationAgentRole = new Role({
  title: 'Registration Agent',
  value: 'REGISTRATION_CLERK',
  types: ['Entrepeneur', 'Data entry clerk'],
  active: true
})

const regitstrarRole = new Role({
  title: 'Registrar',
  value: 'LOCAL_REGISTRAR',
  types: ['Secretary', 'Chairman', 'Mayor'],
  active: true
})

const sysAdminLocalRole = new Role({
  title: 'System admin (local)',
  value: 'LOCAL_SYSTEM_ADMIN',
  types: ['System admin (local)'],
  active: true
})

const sysAdminNationalRole = new Role({
  title: 'System admin (national)',
  value: 'LOCAL_SYSTEM_NATIONAL',
  types: ['System admin (national)'],
  active: true
})

const performanceOversightRole = new Role({
  title: 'Performance Oversight',
  value: 'PERFORMANCE_OVERSIGHT',
  types: ['Cabinet Division', 'BBS'],
  active: true
})

const performanceMgntRole = new Role({
  title: 'Performance Management',
  value: 'PERFORMANCE_MANAGEMENT',
  types: ['Health Division', 'ORG Division'],
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
