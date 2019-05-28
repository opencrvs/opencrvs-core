import { model, Schema, Document } from 'mongoose'

interface IUser {
  name: string
  email?: string
  mobile: string
  passwordHash: string
  salt: string
  role: string
  practitionerId?: string
  scope: string[]
  active: boolean
  creationDate: number
}
export interface IUserModel extends IUser, Document {}

const userSchema = new Schema({
  name: String,
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  practitionerId: String,
  scope: { type: [String], required: true },
  active: { type: Boolean, default: true },
  creationDate: { type: Number, default: Date.now }
})

export default model<IUserModel>('User', userSchema)
