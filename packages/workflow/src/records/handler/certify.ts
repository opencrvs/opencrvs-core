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
  Bundle,
  CertifiedRecord,
  changeState,
  Composition,
  isComposition,
  Resource,
  SavedBundle,
  SavedComposition,
  urlReferenceToUUID,
  ValidRecord
} from '@opencrvs/commons/types'
import { createRoute } from '@workflow/states'
import { validateRequest } from '@workflow/utils'
import { getToken } from '@workflow/utils/authUtils'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { requestSchema } from '@workflow/records/validations/certify'
import { toCertified } from '@workflow/records/state-transitions'
import { uploadBase64ToMinio } from '@workflow/documents'
import { getAuthHeader } from '@opencrvs/commons/http'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { UUID } from '@opencrvs/commons'

function toSavedComposition(
  composition: Composition,
  id: UUID,
  record: Bundle,
  bundleResponse: Awaited<ReturnType<typeof sendBundleToHearth>>
): SavedComposition {
  return {
    ...composition,
    section: composition.section.map((section) => ({
      ...section,
      entry: section.entry.map((sectionEntry) => ({
        ...sectionEntry,
        reference:
          bundleResponse.entry[
            record.entry.findIndex(
              (entry) => entry.fullUrl === sectionEntry.reference
            )
          ].response.location
      }))
    })),
    id
  }
}

function mergeIdsFromResponse<T extends Resource>(
  record: Bundle<T>,
  bundleResponse: Awaited<ReturnType<typeof sendBundleToHearth>>
): SavedBundle<T> {
  return {
    ...record,
    entry: record.entry.map((entry, index) => {
      if (isComposition(entry.resource)) {
        return {
          fullUrl: bundleResponse.entry[index].response.location,
          resource: toSavedComposition(
            entry.resource,
            urlReferenceToUUID(bundleResponse.entry[index].response.location),
            record,
            bundleResponse
          )
        }
      }
      return {
        ...entry,
        fullUrl: bundleResponse.entry[index].response.location,
        resource: {
          ...entry.resource,
          id: urlReferenceToUUID(bundleResponse.entry[index].response.location)
        }
      }
    })
  } as SavedBundle<T>
}

function mergeBundles(
  record: ValidRecord,
  changedBundle: SavedBundle
): SavedBundle {
  const existingResourceIds = record.entry.map(({ resource }) => resource.id)
  const newEntries = changedBundle.entry.filter(
    ({ resource }) => !existingResourceIds.includes(resource.id)
  )
  return {
    ...record,
    entry: [
      ...record.entry.map((previousEntry) => ({
        ...previousEntry,
        resource:
          changedBundle.entry.find(
            (newEntry) => newEntry.resource.id === previousEntry.resource.id
          )?.resource ?? previousEntry.resource
      })),
      ...newEntries
    ]
  }
}

export const certifyRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/certify-record',
  allowedStartStates: ['REGISTERED'],
  action: 'CERTIFY',
  handler: async (request, record): Promise<CertifiedRecord> => {
    const token = getToken(request)
    const {
      certificate: { data, ...certificateDetailsWithoutData },
      event
    } = validateRequest(requestSchema, request.payload)
    const dataUrl = await uploadBase64ToMinio(data, getAuthHeader(request))
    const changedResources = await toCertified(
      record,
      await getLoggedInPractitionerResource(token),
      event,
      { ...certificateDetailsWithoutData, dataUrl }
    )
    const response = await sendBundleToHearth(changedResources)
    const changedResourcesBundle = mergeIdsFromResponse(
      changedResources,
      response
    )
    const certifiedRecord = changeState(
      mergeBundles(record, changedResourcesBundle),
      'CERTIFIED'
    )
    return certifiedRecord
  }
})
