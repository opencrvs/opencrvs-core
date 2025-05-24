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
import { Location } from '@events/service/locations/locations'
import { IntlShape, useIntl } from 'react-intl'
import {
  EventState,
  FieldConfig,
  FieldValue,
  isAddressFieldType,
  isCountryFieldType,
  isAdministrativeAreaFieldType,
  isFacilityFieldType,
  isOfficeFieldType,
  isLocationFieldType,
  isRadioGroupFieldType,
  isSelectFieldType
} from '@opencrvs/commons/client'
import {
  Address,
  AdministrativeArea,
  RadioGroup,
  SelectCountry as Country,
  Select,
  LocationSearch
} from '@client/v2-events/features/events/registered-fields'
import { useLocations } from './useLocations'

interface RecursiveStringRecord {
  [key: string]: string | undefined | RecursiveStringRecord
}

type FieldStringifier = (
  fieldConfig: FieldConfig,
  value: FieldValue
) => string | RecursiveStringRecord

export function stringifySimpleField(intl: IntlShape, locations: Location[]) {
  return (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = { config: fieldConfig, value }
    if (
      isLocationFieldType(field) ||
      isAdministrativeAreaFieldType(field) ||
      isFacilityFieldType(field) ||
      isOfficeFieldType(field)
    ) {
      // Since all of the above field types are actually locations
      return AdministrativeArea.stringify(locations, field.value)
    }

    if (isRadioGroupFieldType(field)) {
      return RadioGroup.stringify(intl, field.value, field.config)
    }

    if (isCountryFieldType(field)) {
      return Country.stringify(intl, field.value)
    }

    if (isSelectFieldType(field)) {
      return Select.stringify(intl, field.value, field.config)
    }

    return !value ? '' : value.toString()
  }
}

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

/**
 *
 * Used for transforming the form data to a string representation. Useful with useIntl hook, where all the properties need to be present.
 */
export const getFormDataStringifier = (
  intl: IntlShape,
  locations: Location[]
) => {
  const simpleFieldStringifier = stringifySimpleField(intl, locations)

  const stringifier = (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = { config: fieldConfig, value }
    if (isAddressFieldType(field)) {
      return Address.stringify(intl, locations, field.value)
    }

    if (isFacilityFieldType(field)) {
      return LocationSearch.stringify(intl, locations, field.value)
    }

    return simpleFieldStringifier(fieldConfig, value)
  }

  return formDataStringifierFactory(stringifier)
}

export function useFormDataStringifier() {
  const intl = useIntl()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  return getFormDataStringifier(intl, locations)
}
