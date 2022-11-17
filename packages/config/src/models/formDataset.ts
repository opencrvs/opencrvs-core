import { Document, model, Schema } from 'mongoose'
import { IMessage, message } from './question'

export interface IOption {
  value: string
  label: IMessage[]
}
export interface IDataset {
  fileName: string
  options: IOption[]
  createdAt: string
  createdBy: string
}

export interface IDataSetModel extends IDataset, Document {}

export const optionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: [{ type: message, required: true }]
  },
  { _id: false }
)

const FormDatasetSchema = new Schema({
  options: [
    {
      type: optionSchema,
      required: true
    }
  ],
  fileName: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true }
})

export default model<IDataSetModel>('FormDataset', FormDatasetSchema)
