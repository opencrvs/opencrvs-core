import { model, Schema, Document } from 'mongoose'

interface IUser {
  name: string
  email: string
  mobile: string
  passwordHash: string
  salt: string
  role: string
  scope: string[]
}
export interface IUserModel extends IUser, Document {}

const userSchema = new Schema({
  name: String,
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  scope: { type: [String], required: true }
})

export default model<IUserModel>('User', userSchema)
