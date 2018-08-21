import { Validation } from '../utils/validate'

export interface IFormField {
  name: string
  type: string
  label: string
  validate: Validation[]
}

export interface IForm {
  tabs: Array<{
    id: string
    name: string
    title: string
    fields: IFormField[]
  }>
}
