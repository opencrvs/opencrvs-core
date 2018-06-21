import { FormattedMessage, MessageValue } from 'react-intl'

export type Validation = (
  value: any
) =>
  | {
      message: FormattedMessage.MessageDescriptor
      props?: { [key: string]: MessageValue }
    }
  | undefined

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
