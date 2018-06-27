import * as mongoose from 'mongoose'

import User from '../src/model/user'
import { generateSaltedHash } from '../src/utils/password'

mongoose.connect('mongodb://localhost/test')

const pass = generateSaltedHash('test')

const zaUserChw = new User({
  email: 'test@test.org',
  mobile: '+27811111111', // 10 digits long, starts with 08 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'chw'
})

const gbUserChw = new User({
  email: 'test@test.org',
  mobile: '+447111111111', // 11 digits long, starts with 07 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'chw'
})

const bdUserChw = new User({
  email: 'test@test.org',
  mobile: '+8801711111111', // 11 digits long, starts with 017 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'chw'
})

const fiUserChw = new User({
  email: 'test@test.org',
  mobile: '+358411111111', // 10 or 11 digits long, starts with 04x, 0457 or 050 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'chw'
})

const zaUserRegistrar = new User({
  email: 'test@test.org',
  mobile: '+27822222222', // 10 digits long, starts with 08 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'registrar'
})

const gbUserRegistrar = new User({
  email: 'test@test.org',
  mobile: '+447222222222', // 11 digits long, starts with 07 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'registrar'
})

const bdUserRegistrar = new User({
  email: 'test@test.org',
  mobile: '+8801722222222', // 11 digits long, starts with 017 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'registrar'
})

const fiUserRegistrar = new User({
  email: 'test@test.org',
  mobile: '+358422222222', // 10 or 11 digits long, starts with 04x, 0457 or 050 locally
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'registrar'
})
const testUsers = [
  zaUserChw,
  gbUserChw,
  bdUserChw,
  fiUserChw,
  zaUserRegistrar,
  gbUserRegistrar,
  bdUserRegistrar,
  fiUserRegistrar
]

function onInsert(err: any, values: any) {
  if (!err) {
    mongoose.disconnect()
  }
}

User.collection.insert(testUsers, onInsert)
