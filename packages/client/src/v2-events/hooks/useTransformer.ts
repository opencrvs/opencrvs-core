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

import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import {
  ActionFormData,
  findPageFields,
  FieldType
} from '@opencrvs/commons/client'
import { fieldValueToString } from '@client/v2-events/components/forms/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
// eslint-disable-next-line no-restricted-imports
import { getLocations } from '@client/offline/selectors'

export const useTransformer = (eventType: string) => {
  const intl = useIntl()

  const locations = useSelector(getLocations)

  const { eventConfiguration } = useEventConfiguration(eventType)

  const fields = findPageFields(eventConfiguration)

  const toString = (values: ActionFormData) => {
    const stringifiedValues: Record<string, string> = {}

    for (const [key, value] of Object.entries(values)) {
      const fieldConfig = fields.find((field) => field.id === key)

      if (!fieldConfig) {
        throw new Error(`Field not found for ${key}`)
      }

      if (
        fieldConfig.type === FieldType.FILE ||
        fieldConfig.type === FieldType.FILE_WITH_OPTIONS
      ) {
        continue
      }

      stringifiedValues[key] = fieldValueToString({
        fieldConfig,
        value,
        intl,
        locations
      })
    }
    return stringifiedValues
  }
  return { toString }
}
