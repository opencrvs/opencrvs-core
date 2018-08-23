import { Validation } from '../utils/validate'
import { FormattedMessage } from 'react-intl'

export interface ISelectOption {
  value: string
  label: string
}
export interface IFormField {
  name: string
  type: string
  label: string
  validate: Validation[]
  required?: boolean
  options?: ISelectOption[]
}

export interface IFormSection {
  id: string
  name: FormattedMessage.MessageDescriptor
  title: string
  fields: IFormField[]
}

export interface IForm {
  sections: IFormSection[]
}
