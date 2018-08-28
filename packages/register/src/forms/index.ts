import { Validation } from '../utils/validate'
import { FormattedMessage } from 'react-intl'

export interface ISelectOption {
  value: string
  label: string
}
export interface IFormField {
  name: string
  type: string
  label: FormattedMessage.MessageDescriptor
  validate: Validation[]
  required?: boolean
  options?: ISelectOption[]
}

export interface IFormSection {
  id: string
  name: FormattedMessage.MessageDescriptor
  title: FormattedMessage.MessageDescriptor
  fields: IFormField[]
}

export interface IForm {
  sections: IFormSection[]
}
