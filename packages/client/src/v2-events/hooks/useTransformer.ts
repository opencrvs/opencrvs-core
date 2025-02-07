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

import { defaultTo } from 'lodash'
import {
  ActionFormData,
  findPageFields,
  FieldType
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'

/**
 *
 * Used for transforming the form data to a string representation. Useful with useIntl hook, where all the properties need to be present.
 */
export const useTransformer = (eventType: string) => {
  const { eventConfiguration } = useEventConfiguration(eventType)

  const fields = findPageFields(eventConfiguration)

  const toString = (values: ActionFormData) => {
    const stringifiedValues: Record<string, string> = {}

    for (const [key, value] of Object.entries(values)) {
      const fieldConfig = fields.find((field) => field.id === key)

      if (!fieldConfig) {
        throw new Error(`Field not found for ${key}`)
      }

      if (fieldConfig.type === FieldType.FILE) {
        continue
      }

      // @TODO: Extend this if we need to modify the value based on the field type
      stringifiedValues[key] = defaultTo(value.toString(), '')
    }

    return stringifiedValues
  }

  return {
    toString
  }
}
