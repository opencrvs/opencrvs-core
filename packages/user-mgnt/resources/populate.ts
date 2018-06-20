import * as mongoose from 'mongoose'

import User from '../src/model/user'
import { generateSaltedHash } from '../src/utils/password'

mongoose.connect('mongodb://localhost/test')

const pass = generateSaltedHash('test')

const user = new User({
  email: 'test@test.org',
  mobile: '27855555555',
  passwordHash: pass.hash,
  salt: pass.salt,
  role: 'test'
})

user.save().then(() => {
  mongoose.disconnect()
})
