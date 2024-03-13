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
import { formMessages } from '@client/i18n/messages'

export function getMotherDateOfBirthLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  }
}

export function getFatherDateOfBirthLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  }
}

export function getDateOfMarriageLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  }
}

export function identityHelperTextMapper(
  code: string
): MessageDescriptor | undefined {
  switch (code) {
    case 'NATIONAL_ID':
      return formMessages.helperTextNID
    default:
      return undefined
  }
}

export function identityNameMapper(code: string): MessageDescriptor {
  switch (code) {
    case 'NATIONAL_ID':
      return formMessages.iDTypeNationalID
    case 'PASSPORT':
      return formMessages.iDTypePassport
    case 'DRIVING_LICENSE':
      return formMessages.iDTypeDrivingLicense
    case 'BIRTH_REGISTRATION_NUMBER':
      return formMessages.iDTypeBRN
    case 'DEATH_REGISTRATION_NUMBER':
      return formMessages.iDTypeDRN
    case 'REFUGEE_NUMBER':
      return formMessages.iDTypeRefugeeNumber
    case 'ALIEN_NUMBER':
      return formMessages.iDTypeAlienNumber
    default:
      return formMessages.iD
  }
}

export function identityTooltipMapper(code: string): MessageDescriptor {
  switch (code) {
    case 'NATIONAL_ID':
      return formMessages.tooltipNationalID
    case 'BIRTH_REGISTRATION_NUMBER':
      return formMessages.iDTypeBRN
    default:
      return formMessages.iD
  }
}
