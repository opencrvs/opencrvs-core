import { defineMessages, FormattedMessage } from 'react-intl'
import { IIntlDynamicProps } from '@opencrvs/components/lib/utils/intlUtils'

export type Validation = (
  value: any
) => FormattedMessage.MessageDescriptor | undefined

export const messages = defineMessages({
  required: {
    id: 'required',
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields'
  },
  minLength: {
    id: 'minLength',
    defaultMessage: 'Must be {min} characters or more',
    description:
      'The error message that appears on fields with a minimum length'
  },
  numberRequired: {
    id: 'numberRequired',
    defaultMessage: 'Must be a number',
    description:
      'The error message that appears on fields where the value must be a number'
  }
})

export const dynamicValidationProps: IIntlDynamicProps = {
  minLength: {
    min: 11
  }
}

export const required: Validation = (value: any) =>
  value || typeof value === 'number' ? undefined : messages.required
export const minLength = (min: number) => (value: any) =>
  value && value.length < min ? messages.minLength : undefined
export const isNumber: Validation = (value: any) =>
  value && isNaN(Number(value)) ? messages.numberRequired : undefined
export const minLength11: Validation = minLength(11)
