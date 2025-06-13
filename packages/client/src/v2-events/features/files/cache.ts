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

import _ from 'lodash'
import {
  ActionDocument,
  Draft,
  EventDocument,
  FileFieldValue,
  FileFieldWithOptionValue,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { removeCached } from '@client/v2-events/cache'
import { precacheFile } from './useFileUpload'

/**
 *
 * @param storageKey - minio path including the bucket details. e.g. /ocrvs/signature.png
 * @returns filename extracted from the storage key.
 *
 */
function extractFilenameFromStorageKey(storageKey: string) {
  try {
    const regex = new RegExp(`^/${window.config.MINIO_BUCKET}/([^/?#]+)`)
    const match = storageKey.match(regex)

    if (match && match[1]) {
      return match[1]
    }
    // Since the key is defined in the window (external to us), we want to ensure we do not crash because of manual changes to the config.
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error extracting filename from storage key:', error)

    return undefined
  }
}

export function getFilenamesFromActionDocument(
  actions: ActionDocument[] | Draft['action'][]
): string[] {
  const filenames = actions.flatMap((action) => {
    const { declaration, annotation, ...metadata } = action
    const declarationValues = Object.values(action.declaration)
    const annotationValues = Object.values(action.annotation ?? {})

    // Signatures follow v1 pattern where storage key includes the bucket name. e.g. /ocrvs/signature.png
    // We need to extract the filename from the storage key.
    const metadataSignatureFilenames = Object.values(metadata)
      .map((val) =>
        typeof val === 'string' ? extractFilenameFromStorageKey(val) : undefined
      )
      .filter((val): val is string => typeof val === 'string')

    const actionFileNames = [...declarationValues, ...annotationValues].flatMap(
      (value) => {
        // Handle single file field & signatures
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
      }
    )

    return [...actionFileNames, ...metadataSignatureFilenames]
  })

  return _.uniq(filenames)
}

export async function cacheFiles(eventDocument: EventDocument) {
  const actions = getAcceptedActions(eventDocument)
  const fileNames = getFilenamesFromActionDocument(actions)

  return Promise.all(fileNames.map(async (filename) => precacheFile(filename)))
}

export async function removeCachedFiles(eventDocument: EventDocument) {
  const actions = getAcceptedActions(eventDocument)
  const fileNames = getFilenamesFromActionDocument(actions)

  return Promise.all(fileNames.map(removeCached))
}
