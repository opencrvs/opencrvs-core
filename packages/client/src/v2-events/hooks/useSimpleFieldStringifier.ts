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
import {
  EventState,
  FieldConfig,
  FieldValue,
  isAdministrativeAreaFieldType,
  isCountryFieldType,
  isFacilityFieldType,
  isLocationFieldType,
  isRadioGroupFieldType
} from '@opencrvs/commons/client'
import {
  AdministrativeArea,
  RadioGroup,
  SelectCountry as Country
} from '@client/v2-events/features/events/registered-fields'

export interface RecursiveStringRecord {
  [key: string]: string | undefined | RecursiveStringRecord
}

type FieldStringifier = (
  fieldConfig: FieldConfig,
  value: FieldValue
) => string | RecursiveStringRecord

export const formDataStringifierFactory =
  (stringifier: FieldStringifier) =>
  (formFields: FieldConfig[], values: EventState): RecursiveStringRecord => {
    const stringifiedValues: RecursiveStringRecord = {}

    for (const [key, value] of Object.entries(values)) {
      const fieldConfig = formFields.find((field) => field.id === key)
      if (!fieldConfig) {
        throw new Error(`Field ${key} not found in form config`)
      }
      stringifiedValues[key] = stringifier(fieldConfig, value)
    }

    return stringifiedValues
  }

export function useSimpleFieldStringifier() {
  const stringifyLocation = AdministrativeArea.useStringifier()
  const stringifyRadioGroup = RadioGroup.useStringifier()
  const stringifyCountry = Country.useStringifier()

  return (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = { config: fieldConfig, value }
    if (
      isLocationFieldType(field) ||
      isAdministrativeAreaFieldType(field) ||
      isFacilityFieldType(field)
    ) {
      // Since all of the above field types are actually locations
      return stringifyLocation(field.value)
    }

    if (isRadioGroupFieldType(field)) {
      return stringifyRadioGroup(field.value, field.config)
    }

    if (isCountryFieldType(field)) {
      return stringifyCountry(field.value)
    }

    return !value ? '' : value.toString()
  }
}
