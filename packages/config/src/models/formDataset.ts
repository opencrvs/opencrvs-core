import { Document, model, Schema } from 'mongoose'
import { messageDescriptor } from './question'

export interface IDataset {}

export interface IQuestionModel extends IDataset, Document {}

export const message = new Schema(
  {
    value: { type: String, required: true },
    label: { type: messageDescriptor, required: true }
  },
  { _id: false }
)

const FormDatasetSchema = new Schema({
  options: [
    {
      type: message,
      required: true
    }
  ],
  fileName: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true }
})

export default model<IDataset>('FormDataset', FormDatasetSchema)
