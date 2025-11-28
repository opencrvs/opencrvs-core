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
  FullDocumentPath,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { removeCached } from '@client/v2-events/cache'
import { precacheFile } from './useFileUpload'

function isValidFilepath(filepath: string): filepath is FullDocumentPath {
  try {
    const regex = new RegExp(`^/${window.config.MINIO_BUCKET}/(.*)`)
    return regex.test(filepath)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error matching "${filepath}" with regex`, error)
  }
  return false
}

export function getFilepathsFromActionDocument(
  actions: ActionDocument[] | Draft['action'][]
): FullDocumentPath[] {
  const filepaths = actions.flatMap((action) => {
    const { declaration, annotation, ...metadata } = action
    const declarationValues = Object.values(action.declaration)
    const annotationValues = Object.values(action.annotation ?? {})

    const metadataSignatureFilepaths = Object.values(metadata).filter(
      (val) => typeof val === 'string' && isValidFilepath(val)
    )

    const actionFilePaths = [...declarationValues, ...annotationValues].flatMap(
      (value) => {
        // Handle single file field & signatures
        const fileParsed = FileFieldValue.safeParse(value)
        if (fileParsed.success) {
          return [fileParsed.data.path]
        }

        // Handle multiple file field (file with options)
        const fileOptionParsed = FileFieldWithOptionValue.safeParse(value)
        if (fileOptionParsed.success) {
          return fileOptionParsed.data.map((val) => val.path)
        }

        return []
      }
    )

    return [...actionFilePaths, ...metadataSignatureFilepaths]
  })

  return _.uniq(filepaths)
}

export async function cacheFiles(event: EventDocument) {
  const actions = getAcceptedActions(event)
  const fileNames = getFilepathsFromActionDocument(actions)

  return Promise.all(fileNames.map(async (filename) => precacheFile(filename)))
}

export async function removeCachedFiles(event: EventDocument) {
  const actions = getAcceptedActions(event)
  const fileNames = getFilepathsFromActionDocument(actions)

  return Promise.all(fileNames.map(removeCached))
}
