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
import {
  FieldConfig,
  FieldValue,
  isAddressFieldType
} from '@opencrvs/commons/client'
import { Address } from '@client/v2-events/features/events/registered-fields'
import {
  formDataStringifierFactory,
  useSimpleFieldStringifier
} from './useSimpleFieldStringifier'

function useFieldStringifier(locations?: Location[]) {
  const simpleFieldStringifier = useSimpleFieldStringifier(locations)
  const stringifyAddress = Address.useStringifier()

  return (fieldConfig: FieldConfig, value: FieldValue) => {
    const field = { config: fieldConfig, value }
    if (isAddressFieldType(field)) {
      return stringifyAddress(field.value)
    }

    return simpleFieldStringifier(fieldConfig, value)
  }
}
/**
 *
 * Used for transforming the form data to a string representation. Useful with useIntl hook, where all the properties need to be present.
 */
export const useFormDataStringifier = (locations?: Location[]) => {
  const stringifier = useFieldStringifier(locations)
  return formDataStringifierFactory(stringifier)
}
