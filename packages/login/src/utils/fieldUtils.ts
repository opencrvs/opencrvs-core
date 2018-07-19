import { InjectedIntl, Messages } from 'react-intl'
import { Validation } from './validate'
import { Field } from 'redux-form'
import { IInputFieldProps } from '@opencrvs/components/lib/InputField'

export type IReduxFormFieldProps = {
  id: string
  name: string
  validate: Validation[]
  disabled: boolean
  type: string
  min?: number
  maxLength?: number
  placeholder?: string
  label?: string
}

export type IFieldGroup = {
  [key: string]: IReduxFormFieldProps
}

export type IFieldRefGroup = {
  [key: string]: React.RefObject<Field<IReduxFormFieldProps & IInputFieldProps>>
}

export const getFieldProps = (
  intl: InjectedIntl,
  field: IReduxFormFieldProps,
  messages: Messages
): IReduxFormFieldProps => {
  const placeholder = messages[`${field.id}Placeholder`]
    ? intl.formatMessage(messages[`${field.id}Placeholder`])
    : undefined
  const label = messages[`${field.id}Label`]
    ? intl.formatMessage(messages[`${field.id}Label`])
    : undefined
  return {
    ...field,
    placeholder,
    label
  }
}
