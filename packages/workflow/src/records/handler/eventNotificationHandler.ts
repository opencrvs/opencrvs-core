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
import * as Hapi from '@hapi/hapi'
import {
  addExtensionsToTask,
  Bundle,
  EVENT_TYPE,
  findCompositionIdFromTransactionResponse,
  getComposition,
  getTaskFromSavedBundle,
  getTrackingId,
  Resource,
  StringExtensionType,
  Task
} from '@opencrvs/commons/types'
import { getToken, getTokenPayload } from '@workflow/utils/auth-utils'
import { indexBundle } from '@workflow/records/search'
import { sendBundleToHearth } from '@workflow/records/fhir'
// import { sendBundleToHearth, toSavedBundle } from '@workflow/records/fhir'
import { getSystem } from '@workflow/features/user/utils'
import { internal } from '@hapi/boom'
import { getTaskResourceFromFhirBundle } from '@workflow/features/registration/fhir/fhir-template'
import { auditEvent } from '@workflow/records/audit'
import {
  generateTrackingIdForEvents,
  getEventType
} from '@workflow/features/registration/utils'
import { getFromFhir } from '@workflow/features/registration/fhir/fhir-utils'
import { getValidRecordById } from '@workflow/records'
import { SEARCH_URL } from '@workflow/constants'
import { updateTaskWithDuplicateIds } from '@workflow/utils/duplicate-checker'

export async function eventNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as Bundle<Resource>
  const token = getToken(request)

  const unsavedTask = getTaskResourceFromFhirBundle(bundle)

  const tokenPayload = getTokenPayload(token)
  const system = await getSystem(tokenPayload.sub, {
    Authorization: `Bearer ${token}`
  })

  const practitioner = await getFromFhir(
    `/Practitioner/${system.practitionerId}`
  )

  const { name, username, type } = system
  const systemInformationJSON = { name, username, type }

  const taskWithRegLastUser = addExtensionsToTask(unsavedTask, [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: {
        reference: `Practitioner/${practitioner.id}`
      }
    }
  ])

  const event = getEventType(bundle)
  const trackingId = await generateTrackingIdForEvents(event, bundle, token)

  const taskWithRegLastUserAndStatus: Task = {
    ...taskWithRegLastUser,
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'IN_PROGRESS'
        }
      ]
    },
    identifier: [
      ...taskWithRegLastUser.identifier,
      {
        system: `http://opencrvs.org/specs/id/${
          event.toLowerCase() as Lowercase<EVENT_TYPE>
        }-tracking-id`,
        value: trackingId
      },
      {
        system: 'http://opencrvs.org/specs/id/system_identifier',
        value: JSON.stringify(systemInformationJSON)
      }
    ]
  }

  const officeExtension = taskWithRegLastUserAndStatus.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regLastOffice'
  ) as
    | StringExtensionType['http://opencrvs.org/specs/extension/regLastOffice']
    | undefined

  if (!officeExtension) throw internal('Office id not found in bundle')

  const savedBundleWithRegLastUserAndBusinessStatus = {
    ...bundle,
    entry: [
      ...bundle.entry.filter((e) => e.resource.resourceType !== 'Task'),
      {
        fullUrl: bundle.entry.find((e) => e.resource.resourceType === 'Task')
          ?.fullUrl,
        resource: taskWithRegLastUserAndStatus
      }
    ]
  }

  const responseBundle = await sendBundleToHearth(
    savedBundleWithRegLastUserAndBusinessStatus
  )

  const compositionId = findCompositionIdFromTransactionResponse(responseBundle)
  const updatedBundle = await getValidRecordById(compositionId!, token, true)

  const duplicateCheckResponse = await fetch(
    new URL('check-duplicates', SEARCH_URL).href,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedBundle)
    }
  )

  if (!duplicateCheckResponse.ok) {
    throw internal('Failed to check for duplicates from search microservice')
  }

  const response: any = await duplicateCheckResponse.json()

  if (response.duplicateIds && response.duplicateIds.length > 0) {
    // throw internal('Duplicates found !!!')
    await indexBundle(updatedBundle, token)
    let task = getTaskFromSavedBundle(updatedBundle)
    task = updateTaskWithDuplicateIds(task, response.duplicateIds)
    await sendBundleToHearth({
      ...updatedBundle,
      entry: [{ resource: task }]
    })
    return {
      compositionId: getComposition(updatedBundle).id,
      trackingId: getTrackingId(updatedBundle),
      isPotentiallyDuplicate: true
    }
  }

  await indexBundle(updatedBundle, token)

  await auditEvent('sent-notification', updatedBundle, token)

  return h.response(updatedBundle).code(200)
}
