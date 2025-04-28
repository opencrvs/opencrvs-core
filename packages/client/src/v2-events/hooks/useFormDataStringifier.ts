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
import { IntlShape } from 'react-intl'
import {
  FieldConfig,
  FieldValue,
  isAddressFieldType
} from '@opencrvs/commons/client'
import { Address } from '@client/v2-events/features/events/registered-fields'
import {
  formDataStringifierFactory,
  stringifySimpleField
} from './useSimpleFieldStringifier'

function useFieldStringifier(intl: IntlShape, locations: Location[]) {
  const simpleFieldStringifier = stringifySimpleField(intl, locations)

  return (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = { config: fieldConfig, value }
    if (isAddressFieldType(field)) {
      return Address.stringify(intl, locations, field.value)
    }

    return simpleFieldStringifier(fieldConfig, value)
  }
}
/**
 *
 * Used for transforming the form data to a string representation. Useful with useIntl hook, where all the properties need to be present.
 */
export const getFormDataStringifier = (
  intl: IntlShape,
  locations: Location[]
) => {
  const stringifier = useFieldStringifier(intl, locations)
  return formDataStringifierFactory(stringifier)
}
