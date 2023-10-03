/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { MessageDescriptor } from 'react-intl'
import { PrimitiveType } from 'intl-messageformat'
import { messages } from '@login/i18n/messages/validations'
import { validate as validateEmail } from 'email-validator'
export interface IValidationResult {
  message: MessageDescriptor
  props?: { [key: string]: PrimitiveType }
}

export type Validation = (value: string) => IValidationResult | undefined

export const isAValidPhoneNumberFormat = (value: string): boolean => {
  const pattern = window.config.PHONE_NUMBER_PATTERN
  return new RegExp(pattern).test(value)
}
export const isAValidEmailAddressFormat = (value: string): boolean => {
  return validateEmail(value)
}

export const requiredSymbol: Validation = (value: string) =>
  value ? undefined : { message: messages.requiredSymbol }

export const required: Validation = (value: string) =>
  value ? undefined : { message: messages.required }

export const minLength = (min: number) => (value: string) => {
  return value && value.length < min
    ? { message: messages.minLength, props: { min } }
    : undefined
}

export const isNumber: Validation = (value: string) =>
  value && isNaN(Number(value))
    ? { message: messages.numberRequired }
    : undefined

export const phoneNumberFormat: Validation = (value: string) => {
  const trimmedValue = value === undefined || value === null ? '' : value.trim()

  if (!trimmedValue) {
    return undefined
  }

  return isAValidPhoneNumberFormat(trimmedValue)
    ? undefined
    : {
        message: messages.phoneNumberFormat
      }
}

export const emailAddressFormat: Validation = (value: string) => {
  const cast = value as string
  if (!cast) {
    return
  }

  return cast && isAValidEmailAddressFormat(cast)
    ? undefined
    : {
        message: messages.emailAddressFormat
      }
}
