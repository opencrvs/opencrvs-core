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
  EventConfig,
  EventDocument,
  FieldConfig,
  findPageFields,
  isFileFieldType,
  isFileFieldWithOptionType
} from '@opencrvs/commons/client'
import { precacheFile } from './useFileUpload'

export async function cacheFiles(
  eventDocument: EventDocument,
  eventConfig: EventConfig
) {
  const fieldTypeMapping = findPageFields(eventConfig).reduce<
    Record<string, FieldConfig>
  >((acc, field) => {
    acc[field.id] = field
    return acc
  }, {})

  const promises: Promise<void>[] = []

  eventDocument.actions.forEach((action) =>
    Object.entries(action.data).forEach(([key, value]) => {
      const field = { config: fieldTypeMapping[key], value }

      if (isFileFieldType(field)) {
        promises.push(precacheFile(field.value.filename))
      }
      if (isFileFieldWithOptionType(field)) {
        field.value.forEach((val) => promises.push(precacheFile(val.filename)))
      }
    })
  )

  await Promise.all(promises)
}
