import { Validation } from '../utils/validate'
import { FormattedMessage } from 'react-intl'

export interface ISelectOption {
  value: string
  label: FormattedMessage.MessageDescriptor
}
export interface IFormField {
  name: string
  type: string
  label: FormattedMessage.MessageDescriptor
  validate: Validation[]
  required?: boolean
  options?: ISelectOption[]
  prefix?: React.ComponentClass<any> | React.SFC | string
  postfix?: React.ComponentClass<any> | React.SFC | string
  disabled?: boolean
  initialValue?: string
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

export interface Ii18nSelectOption {
  value: string
  label: string
}
export interface Ii18nFormField {
  name: string
  type: string
  label: string
  validate: Validation[]
  required?: boolean
  options?: ISelectOption[]
  prefix?: React.ComponentClass<any> | React.SFC | string
  postfix?: React.ComponentClass<any> | React.SFC | string
  disabled?: boolean
}

export interface IFormSectionData {
  [key: string]: string
}

export interface IFormData {
  [key: string]: IFormSectionData
}
