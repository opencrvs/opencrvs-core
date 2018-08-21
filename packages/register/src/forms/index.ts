import { Validation } from '../utils/validate'

export interface IFormField {
  name: string
  type: string
  label: string
  validate: Validation[]
}

export interface IFormTab {
  id: string
  name: string
  title: string
  fields: IFormField[]
}

export interface IForm {
  tabs: IFormTab[]
}
