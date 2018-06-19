import * as mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: { type: String, required: true }
})

export default mongoose.model('User', userSchema)
