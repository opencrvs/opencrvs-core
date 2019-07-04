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
  practitionerId: '74e076cd-5663-409d-91a9-335c19660c3f',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'fca00fb7-ce04-4820-a938-a4e11b2d8afb',
  primaryOfficeId: '61f745b4-5e97-4b06-9560-429df5ca511b',
  catchmentAreaIds: [
    'e5320d3c-78b3-4122-9dfd-9324906ab7de',
    'd3b6592e-c674-4b01-bd89-bee0c8103d45',
    '036de332-68be-4acd-bd51-d93c50cfeff3',
    '33bb66cc-6da6-4f40-8edd-b1985199af3d'
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
  practitionerId: '18f0b714-b8dc-442f-a565-96aa4f954f32',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'f9af90e7-d15e-444c-8ab1-cc39cdd64f89',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: ['759a0452-ef5b-4853-95d0-2f231c22e230'],
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
  practitionerId: '218dbf20-274a-47a3-8c8d-50007e52d5ec',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
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
  practitionerId: '5cbe14da-66fc-4ac5-9d72-bc5d6b69e7c0',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
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
  practitionerId: '17206db6-0939-4890-a4c8-d65f736dd18b',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'f4295ded-2d2d-485a-a20c-2eff3ae1e253',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'e701100b-4f52-409e-8893-bd6cbc19466c',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: '7c365db1-27c8-4652-b877-beaaa26b73c4',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'a87babd7-b47f-405e-ad7a-a638be2af1dd',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'e579487f-b96e-41fb-8698-e38bd2778255',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: '7d7fc007-37ce-4ad7-bed0-9f67d420e159',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: 'fec985dd-8f68-437e-8d7c-405c797460f7',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  practitionerId: '15f3bfb8-59c4-4652-8ef7-382bed46a970',
  primaryOfficeId: '454b4008-7ffd-4808-9ed4-4613d4047021',
  catchmentAreaIds: [
    '759a0452-ef5b-4853-95d0-2f231c22e230',
    '4140ccc2-a5ed-4008-bf13-96ddbc15eb6c',
    '61f745b4-5e97-4b06-9560-429df5ca511b',
    'e5320d3c-78b3-4122-9dfd-9324906ab7de'
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
  value: 'LOCAL_SYSTEM_NATIONAL',
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
