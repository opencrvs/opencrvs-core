import { IReduxFormFieldProps } from '../type/fields'
import { InjectedIntl, Messages } from 'react-intl'

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
