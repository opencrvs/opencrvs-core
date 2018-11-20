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
  scope: ['declare', 'performance', 'certify', 'demo']
})

const localRegistrar = new User({
  name: 'Mohammad Ashraful',
  email: 'test@test.org',
  mobile: '+8801733333333',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'Local Registrar',
  scope: ['register', 'certify', 'demo']
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

const testUsers = [
  fieldAgent,
  registrationClerk,
  localRegistrar,
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
