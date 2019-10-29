import { model, Schema, Document } from 'mongoose'
import { MIN_SEQ_NUMBER, MAX_SEQ_NUMBER } from '@resources/bgd/constants'

interface ILocationSequenceNumber {
  locationId: string
  lastUsedSequenceNumber: number
}
export interface ILocationSequenceNumberModel
  extends ILocationSequenceNumber,
    Document {}

const locationSequenceNumberSchema = new Schema(
  {
    locationId: {
      type: String,
      unique: true,
      required: true
    },
    lastUsedSequenceNumber: {
      type: Number,
      required: true,
      min: MIN_SEQ_NUMBER,
      max: MAX_SEQ_NUMBER
    }
  },
  { strict: true }
)

export default model<ILocationSequenceNumberModel>(
  'LocationSequenceNumber',
  locationSequenceNumberSchema
)
