import { model, Schema, Document } from 'mongoose'

interface IUserName {
  use: string
  family: string[]
  given: string[]
}
interface IUser {
  name: IUserName[]
  email: string
  mobile: string
  passwordHash: string
  salt: string
  role: string
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  scope: string[]
  active: boolean
  creationDate: number
}
// tslint:disable-next-line
const UserNameSchema = new Schema(
  {
    use: String,
    given: [String],
    family: [String]
  },
  { _id: false }
)

export interface IUserModel extends IUser, Document {}

const userSchema = new Schema({
  name: [UserNameSchema],
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  practitionerId: String,
  primaryOfficeId: String,
  catchmentAreaIds: [String],
  scope: { type: [String], required: true },
  active: { type: Boolean, default: true },
  creationDate: { type: Number, default: Date.now }
})

export default model<IUserModel>('User', userSchema)
