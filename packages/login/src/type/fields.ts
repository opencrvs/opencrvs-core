import { IIntlDynamicProps } from '@opencrvs/components/lib/utils/intlUtils'
import { FormattedMessage } from 'react-intl'

export type Validation = (
  value: any
) => FormattedMessage.MessageDescriptor | undefined

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
  dynamicErrors?: IIntlDynamicProps
}

export type IFieldGroup = {
  [key: string]: IReduxFormFieldProps
}
