import { model, Schema, Document } from 'mongoose'

interface IUser {
  name: string
  email: string
  mobile: string
  passwordHash: string
  salt: string
  role: string
  claims: string[]
}
export interface IUserModel extends IUser, Document {}

const userSchema = new Schema({
  name: String,
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  claims: { type: [String], required: true }
})

export default model<IUserModel>('User', userSchema)
