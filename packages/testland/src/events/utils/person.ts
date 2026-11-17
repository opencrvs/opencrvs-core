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

import { TranslationConfig } from '@opencrvs/toolkit/events'
import { createSelectOptions } from '../utils'

export const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_REGISTRATION_NUMBER: 'BIRTH_REGISTRATION_NUMBER',
  NONE: 'NONE'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_REGISTRATION_NUMBER: {
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBRN'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

export const idTypeOptions = createSelectOptions(
  IdType,
  idTypeMessageDescriptors
)

// @TODO: Consider whether these can become boolean fields
export const YesNoTypes = {
  YES: 'YES',
  NO: 'NO'
} as const

const yesNoMessageDescriptors = {
  YES: {
    defaultMessage: 'Yes',
    id: 'form.field.label.Yes',
    description: 'Label for form field radio option Yes'
  },
  NO: {
    defaultMessage: 'No',
    id: 'form.field.label.No',
    description: 'Label for form field radio option No'
  }
} satisfies Record<keyof typeof YesNoTypes, TranslationConfig>

export const yesNoRadioOptions = createSelectOptions(
  YesNoTypes,
  yesNoMessageDescriptors
)
