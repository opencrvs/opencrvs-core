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

import { SelectOption, TranslationConfig } from '@opencrvs/toolkit/events'

export const educationalAttainmentOptions = [
  {
    value: 'NO_SCHOOLING',
    label: {
      defaultMessage: 'No schooling',
      description: 'Option for form field: no education',
      id: 'form.field.label.educationAttainmentNone'
    }
  },
  {
    value: 'PRIMARY_ISCED_1',
    label: {
      defaultMessage: 'Primary',
      description: 'Option for form field: ISCED1 education',
      id: 'form.field.label.educationAttainmentISCED1'
    }
  },
  {
    value: 'POST_SECONDARY_ISCED_4',
    label: {
      defaultMessage: 'Secondary',
      description: 'Option for form field: ISCED4 education',
      id: 'form.field.label.educationAttainmentISCED4'
    }
  },
  {
    value: 'FIRST_STAGE_TERTIARY_ISCED_5',
    label: {
      defaultMessage: 'Tertiary',
      description: 'Option for form field: ISCED5 education',
      id: 'form.field.label.educationAttainmentISCED5'
    }
  }
]

export const maritalStatusOptions = [
  {
    value: 'SINGLE',
    label: {
      defaultMessage: 'Single',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusSingle'
    }
  },
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Married',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusMarried'
    }
  },
  {
    value: 'WIDOWED',
    label: {
      defaultMessage: 'Widowed',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusWidowed'
    }
  },
  {
    value: 'DIVORCED',
    label: {
      defaultMessage: 'Divorced',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusDivorced'
    }
  },
  {
    value: 'SEPARATED',
    label: {
      id: 'form.field.label.maritalStatusSeparated',
      defaultMessage: 'Separated',
      description: 'Option for form field: Marital status'
    }
  },
  {
    value: 'NOT_STATED',
    label: {
      defaultMessage: 'Not stated',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusNotStated'
    }
  }
]

export const createSelectOptions = <
  T extends Record<string, string>,
  M extends Record<keyof T, TranslationConfig>
>(
  options: T,
  messageDescriptors: M
): SelectOption[] =>
  Object.entries(options).map(([key, value]) => ({
    value,
    label: messageDescriptors[key as keyof T]
  }))
