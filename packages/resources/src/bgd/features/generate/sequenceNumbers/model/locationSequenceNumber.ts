import { model, Schema, Document } from 'mongoose'

interface ILocationSequenceNumber {
  year: number
  locationId: string
  lastUsedSequenceNumber: number
}
export interface ILocationSequenceNumberModel
  extends ILocationSequenceNumber,
    Document {}

const locationSequenceNumberSchema = new Schema(
  {
    year: { type: Number, required: true },
    locationId: {
      type: String,
      required: true
    },
    lastUsedSequenceNumber: {
      type: Number,
      required: true,
      min: 0,
      max: 999999
    }
  },
  { strict: true }
)

export default model<ILocationSequenceNumberModel>(
  'LocationSequenceNumber',
  locationSequenceNumberSchema
)
