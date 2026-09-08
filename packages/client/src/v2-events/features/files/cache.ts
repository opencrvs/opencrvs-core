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
  FileFieldValue,
  FileFieldWithOptionValue,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { isFileCached, removeCached } from '@client/v2-events/cache'
import { precacheFile } from './useFileUpload'

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

/**
 * The files this event refers to that the browser cache cannot answer — either
 * because they were never cached, because they were removed (browser eviction,
 * Chrome's "Cached images and files", `removeCachedFiles`), or because the SPA
 * shell was cached under their URL.
 */
export async function getUncachedFilepaths(event: EventDocument) {
  const actions = getAcceptedActions(event)
  const filenames = getFilepathsFromActionDocument(actions)

  const uncached = await Promise.all(
    filenames.map(async (filename) =>
      (await isFileCached(filename)) ? undefined : filename
    )
  )

  return uncached.filter((filename): filename is DocumentPath => !!filename)
}

/**
 * Re-caches those files, and only those.
 *
 * Needed because an event read back from the persisted react-query cache never
 * re-runs `cacheFiles`: the two caches are cleared independently, so the event
 * document can outlive the files it refers to.
 */
export async function cacheMissingFiles(event: EventDocument) {
  const filenames = await getUncachedFilepaths(event)

  return Promise.all(
    filenames.map(async (filename) => {
      // A poisoned entry has to go before `precacheFile` can replace it.
      await removeCached(filename)

      return precacheFile(filename)
    })
  )
}

export async function removeCachedFiles(event: EventDocument) {
  const actions = getAcceptedActions(event)
  const fileNames = getFilepathsFromActionDocument(actions)

  return Promise.all(fileNames.map(removeCached))
}
