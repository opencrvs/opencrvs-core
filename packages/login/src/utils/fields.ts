import * as validations from './validate'
import { InjectedIntl, Messages } from 'react-intl'
import { IIntlDynamicProps } from '@opencrvs/components/lib/utils/intlUtils'

type IReduxFormFieldProps = {
  id: string
  name: string
  validate: validations.Validation[]
  disabled: boolean
  type: string
  maxLength?: number
  placeholder?: string
  label?: string
  dynamicErrors?: IIntlDynamicProps
}

type IFieldGroup = {
  [key: string]: IReduxFormFieldProps
}

export const stepOneFields: IFieldGroup = {
  mobile: {
    id: 'mobile',
    name: 'mobile',
    maxLength: 11,
    validate: [
      validations.required,
      validations.minLength11,
      validations.isNumber
    ],
    disabled: false,
    type: 'text',
    dynamicErrors: validations.dynamicValidationProps
  },
  password: {
    id: 'password',
    name: 'password',
    validate: [validations.required],
    disabled: false,
    type: 'password'
  }
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
