import { model, Schema, Document } from 'mongoose'

export interface IUsernameRecord {
  username: string
  count: number
}

export interface IUsernameRecordModel extends IUsernameRecord, Document {}

const usernameRecordSchema = new Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 }
})

export default model<IUsernameRecordModel>(
  'UsernameRecord',
  usernameRecordSchema
)
