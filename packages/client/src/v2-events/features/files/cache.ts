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
  EventDocument,
  FileFieldValue,
  FileFieldWithOptionValue
} from '@opencrvs/commons/client'
import { getAcceptedActions } from '@opencrvs/commons/client'
import { precacheFile } from './useFileUpload'

export async function cacheFiles(eventDocument: EventDocument) {
  const promises: Promise<void>[] = []
  const actions = getAcceptedActions(eventDocument)

  actions.forEach((action) =>
    Object.entries(action.data).forEach(([, value]) => {
      const fileParsed = FileFieldValue.safeParse(value)
      if (fileParsed.success) {
        promises.push(precacheFile(fileParsed.data.filename))
      }

      const fileOptionParsed = FileFieldWithOptionValue.safeParse(value)
      if (fileOptionParsed.success) {
        fileOptionParsed.data.forEach((val) =>
          promises.push(precacheFile(val.filename))
        )
      }
    })
  )

  await Promise.all(promises)
}
