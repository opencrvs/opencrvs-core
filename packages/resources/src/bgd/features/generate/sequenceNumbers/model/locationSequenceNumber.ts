import { model, Schema, Document } from 'mongoose'

interface ILocationSequenceNumber {
  locationId: string
  lastUsedSequenceNumber: string
  creationDate: number
}
export interface ILocationSequenceNumberModel
  extends ILocationSequenceNumber,
    Document {}

const locationSequenceNumberSchema = new Schema({
  locationId: String,
  lastUsedSequenceNumber: String,
  creationDate: { type: Number, default: Date.now }
})

export default model<ILocationSequenceNumberModel>(
  'LocationSequenceNumber',
  locationSequenceNumberSchema
)
