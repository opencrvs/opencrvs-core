import { model, Schema, Document } from 'mongoose'

interface IRole {
  title: string
  value: string
  types: string[]
  active: boolean
  creationDate: number
}
export interface IRoleModel extends IRole, Document {}

const roleSchema = new Schema({
  title: String,
  value: String,
  types: [String],
  active: { type: Boolean, default: true },
  creationDate: { type: Number, default: Date.now }
})

export default model<IRoleModel>('Role', roleSchema)
