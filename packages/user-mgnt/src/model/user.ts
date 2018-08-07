import { model, Schema, Document } from 'mongoose'

interface IUser {
  email: string
  mobile: string
  passwordHash: string
  salt: string
  roles: string[]
}
export interface IUserModel extends IUser, Document {}

const userSchema = new Schema({
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  roles: { type: [String], required: true }
})

export default model<IUserModel>('User', userSchema)
