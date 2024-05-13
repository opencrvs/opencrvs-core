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

import { IAuthHeader } from '@opencrvs/commons'
import { fetchDocuments } from '@gateway/features/documents/service'
import { getTokenPayload, getUser } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'
import {
  MAKE_CORRECTION_EXTENSION_URL,
  Resource,
  SavedBundle,
  SavedBundleEntry,
  SavedTask,
  WithUUID
} from '@opencrvs/commons/types'

export async function getPresignedUrlFromUri(
  fileUri: string,
  authHeader: IAuthHeader
) {
  const response = (await fetchDocuments(
    '/presigned-url',
    authHeader,
    'POST',
    JSON.stringify({ fileUri })
  )) as { presignedURL: string }

  return response.presignedURL
}

export async function setCollectorForPrintInAdvance(
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader
) {
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  const userId = tokenPayload.sub
  const userDetails = await getUser({ userId }, authHeader)
  const name = userDetails.name.map((nameItem) => ({
    use: nameItem.use,
    familyName: nameItem.family,
    firstNames: nameItem.given.join(' ')
  }))
  const role = userDetails.role.labels.find(({ lang }) => lang === 'en')?.label

  details?.registration?.certificates?.forEach((certificate) => {
    if (!certificate) return
    if (certificate.collector?.relationship === 'PRINT_IN_ADVANCE') {
      certificate.collector = {
        name,
        relationship: 'PRINT_IN_ADVANCE',
        otherRelationship: role,
        identifier: []
      }
    }
    return certificate
  })

  return details
}

function isTaskHistory(
  savedResource: WithUUID<Resource>
): savedResource is SavedTask {
  return savedResource.resourceType === 'TaskHistory'
}

function isTaskHistoryCorrectionRequested(
  savedTaskHistory: SavedTask
): boolean {
  return (
    savedTaskHistory.status === 'requested' &&
    savedTaskHistory.businessStatus.coding[0].code === 'CORRECTION_REQUESTED'
  )
}
function isTaskHistoryCorrectionAccepted(savedTaskHistory: SavedTask): boolean {
  return (
    savedTaskHistory.status === 'accepted' &&
    savedTaskHistory.businessStatus.coding[0].code === 'CORRECTION_REQUESTED'
  )
}
function isTaskHistoryCorrected(savedTaskHistory: SavedTask): boolean {
  return savedTaskHistory.extension.some(
    (ext) => ext.url === MAKE_CORRECTION_EXTENSION_URL
  )
}

export function excludeTaskCorrectedHistory(
  bundle: SavedBundle<Resource>
): SavedBundle<Resource> {
  const { transformedEntry } = bundle.entry.reduce<{
    context: number[]
    transformedEntry: SavedBundleEntry<Resource>[]
  }>(
    ({ context, transformedEntry }, savedEntry, i) => {
      const savedResource = savedEntry.resource
      if (
        isTaskHistory(savedResource) &&
        isTaskHistoryCorrectionRequested(savedResource)
      ) {
        context.push(i)
        transformedEntry.push(savedEntry)
      } else if (
        isTaskHistory(savedResource) &&
        isTaskHistoryCorrectionAccepted(savedResource)
      ) {
        context.push(i)
        transformedEntry.push(savedEntry)
      } else if (
        isTaskHistory(savedResource) &&
        isTaskHistoryCorrected(savedResource)
      ) {
        if (context[0] < context[1] && context[1] < i) {
          // clear the context and dont add the entry in the transformed entry array
          context = []
        }
      } else {
        transformedEntry.push(savedEntry)
      }
      return { context, transformedEntry }
    },
    { context: [], transformedEntry: [] }
  )
  return {
    ...bundle,
    entry: transformedEntry
  }
}
