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

import { findPageFields } from '@opencrvs/commons/client'
import {
  fieldValueToString,
  FlatFormData
} from '@client/v2-events/components/forms/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'

export const useTransformer = (eventType: string) => {
  const { eventConfiguration } = useEventConfiguration(eventType)

  const fields = eventConfiguration ? findPageFields(eventConfiguration) : []

  const toString = (values: FlatFormData) => {
    const stringifiedValues = values
    for (const [key, value] of Object.entries(values)) {
      const fieldType = fields.find((field) => field.id === key)?.type
      if (!fieldType) {
        throw new Error(`Field not found for ${key}`)
      }
      stringifiedValues[key] = fieldValueToString(fieldType, value)
    }
    return stringifiedValues
  }
  return { toString }
}
