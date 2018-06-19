import { messages as loginMessages } from '../login/StepOneForm'
import { FormattedMessage } from 'react-intl'

export type Validation = (
  value: any
) => FormattedMessage.MessageDescriptor | undefined

export const required: Validation = (value: any) =>
  value || typeof value === 'number' ? undefined : loginMessages.required
export const minLength = (min: number) => (value: any) =>
  value && value.length < min ? loginMessages.minLength : undefined
export const isNumber: Validation = (value: any) =>
  value && isNaN(Number(value)) ? loginMessages.numberRequired : undefined
export const minLength11: Validation = minLength(11)
