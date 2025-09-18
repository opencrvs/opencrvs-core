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
import { useSelector } from 'react-redux'
import { EventState, FieldConfig, FieldValue } from '@opencrvs/commons/client'
import { getRegisteredFieldByFieldConfig } from '@client/v2-events/features/events/registered-fields'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getOfflineData } from '@client/offline/selectors'
import { useLocations } from './useLocations'
interface RecursiveStringRecord {
  [key: string]: string | undefined | RecursiveStringRecord
}

type FieldStringifier = (
  fieldConfig: FieldConfig,
  value: FieldValue
) => string | RecursiveStringRecord

function stringifySimpleField(value: FieldValue) {
  return !value ? '' : value.toString()
}

function formDataStringifierFactory(stringifier: FieldStringifier) {
  return function (
    formFields: FieldConfig[],
    values: EventState
  ): RecursiveStringRecord {
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
}

/**
 *
 * Used for transforming the form data to a string representation. Useful with useIntl hook, where all the properties need to be present.
 */
export const getFormDataStringifier = (
  intl: IntlShape,
  locations: Location[],
  adminLevels?: AdminStructureItem[]
) => {
  const stringifier = (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = getRegisteredFieldByFieldConfig(fieldConfig)
    if (!field) {
      return stringifySimpleField(value)
    }

    if (field.toCertificateVariables) {
      return field.toCertificateVariables(value, {
        intl,
        locations,
        config: fieldConfig,
        adminLevels
      })
    }
    if (field.stringify) {
      return field.stringify(value, {
        intl,
        locations,
        config: fieldConfig
      })
    }
    return stringifySimpleField(value)
  }

  return formDataStringifierFactory(stringifier)
}

export function useFormDataStringifier() {
  const intl = useIntl()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const { config } = useSelector(getOfflineData)
  const adminLevels = config.ADMIN_STRUCTURE

  return getFormDataStringifier(intl, locations, adminLevels)
}
