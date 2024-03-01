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
import { getToken } from '@workflow/utils/authUtils'
import * as Hapi from '@hapi/hapi'
import { getEventType } from '@workflow/features/registration/utils'
import { Bundle, BundleEntry, EVENT_TYPE } from '@opencrvs/commons/types'
import { getRecordById } from '@workflow/records/index'
import { toRegistered } from '@workflow/records/state-transitions'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { indexBundle } from '@workflow/records/search'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { auditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'

export interface IEventRegistrationCallbackPayload {
  trackingId: string
  registrationNumber: string
  error: string
  compositionId: string
  childIdentifiers?: {
    type: string
    value: string
  }[]
}

function getSectionFromResponse(
  response: Bundle,
  reference: string
): BundleEntry[] {
  return (response.entry &&
    response.entry.filter((o) => {
      const res = o.response as fhir3.BundleEntryResponse
      return Object.keys(res).some((k: keyof fhir3.BundleEntryResponse) =>
        (res[k] as string).toLowerCase().includes(reference.toLowerCase())
      )
    })) as BundleEntry[]
}

function getSectionIndex(
  section: fhir3.CompositionSection[]
): number | undefined {
  let index
  section.filter((obj: fhir3.CompositionSection, i: number) => {
    if (
      obj.title &&
      ['Birth encounter', 'Death encounter', 'Marriage encounter'].includes(
        obj.title
      )
    ) {
      index = i
    }
  })
  return index
}

export function populateCompositionWithID(payload: Bundle, response: Bundle) {
  if (
    payload &&
    payload.entry &&
    payload.entry[0].resource &&
    payload.entry[0].resource.resourceType === 'Composition'
  ) {
    const responseEncounterSection = getSectionFromResponse(
      response,
      'Encounter'
    )
    const composition = payload.entry[0].resource as fhir3.Composition
    if (composition.section) {
      const payloadEncounterSectionIndex = getSectionIndex(composition.section)
      if (
        payloadEncounterSectionIndex !== undefined &&
        composition.section[payloadEncounterSectionIndex] &&
        composition.section[payloadEncounterSectionIndex].entry &&
        responseEncounterSection &&
        responseEncounterSection[0] &&
        responseEncounterSection[0].response &&
        responseEncounterSection[0].response.location
      ) {
        const entry = composition.section[payloadEncounterSectionIndex]
          .entry as fhir3.Reference[]
        entry[0].reference =
          responseEncounterSection[0].response.location.split('/')[3]
        composition.section[payloadEncounterSectionIndex].entry = entry
      }
      if (!composition.id) {
        composition.id =
          response &&
          response.entry &&
          response.entry[0].response &&
          response.entry[0].response.location &&
          response.entry[0].response.location.split('/')[3]
      }
      payload.entry[0].resource = composition
    }
  }
}

export async function markEventAsRegisteredCallbackHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const { registrationNumber, error, childIdentifiers, compositionId } =
    request.payload as IEventRegistrationCallbackPayload

  if (error) {
    throw new Error(`Callback triggered with an error: ${error}`)
  }

  const savedRecord = await getRecordById(
    compositionId,
    request.headers.authorization,
    ['WAITING_VALIDATION']
  )
  if (!savedRecord) {
    throw new Error('Could not find record in elastic search!')
  }
  const practitioner = await getLoggedInPractitionerResource(getToken(request))

  const event = getEventType(savedRecord)

  const registeredBundle = await toRegistered(
    request,
    savedRecord,
    practitioner,
    registrationNumber,
    childIdentifiers
  )
  await sendBundleToHearth(registeredBundle)
  await indexBundle(registeredBundle, getToken(request))
  await auditEvent('registered', registeredBundle, token)

  // Notification not implemented for marriage yet
  if (
    event !== EVENT_TYPE.MARRIAGE &&
    (await isNotificationEnabled('registered', event, token))
  ) {
    await sendNotification('registered', registeredBundle, token)
  }

  return h.response(registeredBundle).code(200)
}
