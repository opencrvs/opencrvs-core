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
  ActionDocument,
  EventDocument,
  FileFieldValue,
  FileFieldWithOptionValue,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { precacheFile, removeCached } from './useFileUpload'

function getFilesToCache(actions: ActionDocument[]): string[] {
  return actions.flatMap((action) =>
    Object.values(action.declaration).flatMap((value) => {
      // Handle single file field
      const fileParsed = FileFieldValue.safeParse(value)
      if (fileParsed.success) {
        return [fileParsed.data.filename]
      }

      // Handle multiple file field (file with options)
      const fileOptionParsed = FileFieldWithOptionValue.safeParse(value)
      if (fileOptionParsed.success) {
        return fileOptionParsed.data.map((val) => val.filename)
      }

      return []
    })
  )
}

export async function cacheFiles(eventDocument: EventDocument) {
  const actions = getAcceptedActions(eventDocument)
  const fileNames = getFilesToCache(actions)

  return Promise.all(fileNames.map(precacheFile))
}

export async function removeCachedFiles(eventDocument: EventDocument) {
  const actions = getAcceptedActions(eventDocument)
  const fileNames = getFilesToCache(actions)

  return Promise.all(fileNames.map(removeCached))
}
