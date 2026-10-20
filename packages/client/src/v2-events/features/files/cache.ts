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
  DocumentPath,
  Draft,
  EventDocument,
  isFileFieldValue,
  isFileFieldWithOptionValue,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { precacheFiles, removeCached } from '@client/v2-events/cache'

export function getFilepathsFromActionDocument(
  actions: ActionDocument[] | Draft['action'][]
): DocumentPath[] {
  const filepaths = actions.flatMap((action) => {
    const { declaration, annotation, ...metadata } = action
    const declarationValues = Object.values(action.declaration)
    const annotationValues = Object.values(action.annotation ?? {})

    const signatureKeys = [
      'createdBySignature'
    ] as const satisfies readonly (keyof typeof metadata)[]
    const metadataSignatureFilepaths = signatureKeys
      .map((key) => metadata[key])
      .filter((value): value is DocumentPath => !!value)

    const actionFilePaths = [...declarationValues, ...annotationValues].flatMap(
      (value): DocumentPath[] => {
        // Handle single file field & signatures
        if (isFileFieldValue(value)) {
          return [value.path]
        }

        // Handle multiple file field (file with options)
        if (isFileFieldWithOptionValue(value)) {
          return value.map((val) => val.path)
        }

        return []
      }
    )

    return [...actionFilePaths, ...metadataSignatureFilepaths]
  })

  return _.uniq(filepaths)
}

export function getFilesFromEventDocuments(events: EventDocument[]) {
  return events.flatMap((event) => {
    const actions = getAcceptedActions(event)

    return getFilepathsFromActionDocument(actions)
  })
}

export async function cacheFilesFromEventDocument(event: EventDocument) {
  const actions = getAcceptedActions(event)
  const fileNames = getFilepathsFromActionDocument(actions)

  return precacheFiles(fileNames)
}

export async function removeCachedFiles(event: EventDocument) {
  const actions = getAcceptedActions(event)
  const fileNames = getFilepathsFromActionDocument(actions)

  return Promise.all(fileNames.map(removeCached))
}
