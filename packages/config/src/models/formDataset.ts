import { Document, model, Schema } from 'mongoose'
import { ISelectOption, message } from '@config/models/question'

export interface IDataset {
  fileName: string
  options: ISelectOption[]
  createdAt: string
  createdBy: string
  resource?: string
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
  resource: { type: String },
  fileName: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true }
})

export default model<IDataSetModel>('FormDataset', FormDatasetSchema)
