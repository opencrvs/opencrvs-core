import * as mongoose from 'mongoose'

import User from '../src/model/user'
import { generateSaltedHash } from '../src/utils/password'
import { MONGO_URL } from '../src/constants'
mongoose.connect(MONGO_URL)

const pass = generateSaltedHash('test')

const fieldAgent = new User({
  name: 'Shakib Al Hasan',
  email: 'test@test.org',
  mobile: '+8801711111111',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Field Agent',
  scope: ['declare', 'demo']
})

const registrationClerk = new User({
  name: 'Rabindranath Tagore',
  email: 'test@test.org',
  mobile: '+8801722222222',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Registration Clerk',
  scope: ['register', 'performance', 'certify', 'demo']
})

const localRegistrar = new User({
  name: 'Mohammad Ashraful',
  email: 'test@test.org',
  mobile: '+8801733333333',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Local Registrar',
  scope: ['register', 'performance', 'certify', 'demo']
})

const districtRegistrar = new User({
  name: 'Muhammad Abdul Muid Khan',
  email: 'test@test.org',
  mobile: '+8801744444444',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'District Registrar',
  scope: ['register', 'performance', 'certify', 'demo']
})

const stateRegistrar = new User({
  name: 'Nasreen Pervin Huq',
  email: 'test@test.org',
  mobile: '+8801755555555',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'State Registrar',
  scope: ['register', 'performance', 'certify', 'demo']
})

const nationalRegistrar = new User({
  name: 'Mohamed Abu Abdullah',
  email: 'test@test.org',
  mobile: '+8801766666666',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'National Registrar',
  scope: ['register', 'performance', 'certify', 'config', 'teams', 'demo']
})

const fieldAgent2 = new User({
  name: 'Md. Ariful Islam',
  email: 'test@test.org',
  mobile: '+8801740012994',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Field Agent',
  scope: ['declare', 'demo']
})

const fieldAgent3 = new User({
  name: 'Md. Ashraful Alam',
  email: 'test@test.org',
  mobile: '+8801723438160',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Field Agent',
  scope: ['declare', 'demo']
})

const registrationClerk2 = new User({
  name: 'Lovely Khatun',
  email: 'test@test.org',
  mobile: '+8801797602268',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Registration Clerk',
  scope: ['register', 'performance', 'certify', 'demo']
})

const registrationClerk3 = new User({
  name: 'Md. Seikh Farid',
  email: 'test@test.org',
  mobile: '+8801767332319',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Registration Clerk',
  scope: ['register', 'performance', 'certify', 'demo']
})

const localRegistrar2 = new User({
  name: 'Md. Jahangir Alam',
  email: 'test@test.org',
  mobile: '+8801722038795',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Local Registrar',
  scope: ['register', 'performance', 'certify', 'demo']
})

const localRegistrar3 = new User({
  name: 'A.K.M Mahmudur Rohman',
  email: 'test@test.org',
  mobile: '+8801712142796',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Local Registrar',
  scope: ['register', 'performance', 'certify', 'demo']
})

const fieldAgent4 = new User({
  name: 'Abdullah Al Arafat',
  email: 'test@test.org',
  mobile: '+8801711081454',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Field Agent',
  scope: ['declare', 'demo']
})

const registrationClerk4 = new User({
  name: 'Neelima Yasmeen',
  email: 'test@test.org',
  mobile: '+8801610005011',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Local Registrar',
  scope: ['register', 'performance', 'certify', 'demo']
})

const testUsers = [
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
  nationalRegistrar
]

function onInsert(err: any, values: any) {
  if (!err) {
    mongoose.disconnect()
  }
}

User.collection.insert(testUsers, onInsert)
