import { FormattedMessage } from 'react-intl'
import { Validation } from '@login/utils/validate'
import { Field } from 'redux-form'
import { IInputFieldProps } from '@opencrvs/components/lib/forms'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type Ii18nReduxFormFieldProps = {
  id: string
  name: string
  validate: Validation[]
  disabled: boolean
  type: string
  min?: number
  maxLength?: number
  placeholder?: string
  label?: string
  focusInput: boolean
}

export type IReduxFormFieldProps = {
  placeholder?: FormattedMessage.MessageDescriptor
  label?: FormattedMessage.MessageDescriptor
} & Omit<Ii18nReduxFormFieldProps, 'placeholder' | 'label'>

export type IFieldGroup = {
  [key: string]: IReduxFormFieldProps
}

export type IFieldRefGroup = {
  [key: string]: React.RefObject<Field<IReduxFormFieldProps & IInputFieldProps>>
}
