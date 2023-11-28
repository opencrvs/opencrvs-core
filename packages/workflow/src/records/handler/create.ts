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
  BirthRegistration,
  DeathRegistration,
  EVENT_TYPE,
  MarriageRegistration,
  buildFHIRBundle,
  Bundle,
  getComposition,
  isTask,
  urlReferenceToUUID
} from '@opencrvs/commons/types'
import {
  setupLastRegUser,
  setupLastRegLocation
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
// import {
//   getSharedContactMsisdn,
//   getSharedContactEmail
// } from '@workflow/features/registration/fhir/fhir-utils'
// import { sendCreateRecordNotification } from '@workflow/features/registration/utils'
import { logger } from '@workflow/logger'
import { getToken } from '@workflow/utils/authUtils'
import {
  findTaskFromIdentifier,
  sendBundleToHearth
} from '@workflow/records/fhir'
import { z } from 'zod'
import { indexBundle } from '@workflow/records/search'
import { validateRequest } from '@workflow/utils'
import { hasDuplicates } from '@workflow/utils/duplicateChecker'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import {
  generateTrackingIdForEvents,
  isEventNotification,
  isInProgressDeclaration
} from '@workflow/features/registration/utils'
import { getRecordById } from '@workflow/records'
import { auditEvent } from '@workflow/records/audit'
import { getTrackingId } from '@workflow/features/registration/fhir/fhir-utils'

export const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  record: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >()
})

function findTask(bundle: Bundle) {
  const task = bundle.entry.map((e) => e.resource).find(isTask)
  if (!task) {
    throw new Error('Task not found in bundle')
  }
  return task
}

async function findExistingDeclarationIds(draftId: string) {
  const taskBundle = await findTaskFromIdentifier(draftId)
  if (taskBundle.entry.length > 0) {
    const trackingId = getTrackingId(taskBundle)
    if (!trackingId) {
      throw new Error('No trackingID found for existing declaration')
    }
    return {
      compositionId: taskBundle.entry[0].resource.focus.reference.split('/')[1],
      trackingId
    }
  }
  return null
}

function createInProgressOrReadyForReviewTask(
  previousTask: ReturnType<typeof findTask>,
  event: EVENT_TYPE,
  trackingId: ReturnType<typeof generateTrackingIdForEvents>,
  inProgress: boolean
): ReturnType<typeof findTask> {
  return {
    ...previousTask,
    identifier: [
      ...previousTask.identifier,
      {
        system: `http://opencrvs.org/specs/id/${
          event.toLowerCase() as Lowercase<EVENT_TYPE>
        }-tracking-id`,
        value: trackingId
      }
    ],
    code: {
      coding: [
        {
          system: `http://opencrvs.org/specs/types`,
          code: event
        }
      ]
    },
    businessStatus: {
      coding: [
        {
          system: `http://opencrvs.org/specs/reg-status`,
          code: inProgress ? 'IN_PROGRESS' : 'DECLARED'
        }
      ]
    }
  }
}

export default async function createRecordHandler(
  request: Hapi.Request,
  _: Hapi.ResponseToolkit
) {
  try {
    const token = getToken(request)
    const { record: recordDetails, event } = validateRequest(
      requestSchema,
      request.payload
    )

    const existingDeclarationIds =
      recordDetails.registration?.draftId &&
      (await findExistingDeclarationIds(recordDetails.registration.draftId))
    if (existingDeclarationIds) {
      return {
        ...existingDeclarationIds,
        isPotentiallyDuplicate: false
      }
    }

    const inputBundle = buildFHIRBundle(recordDetails, event)
    const practitioner = await getLoggedInPractitionerResource(token)
    const trackingId = generateTrackingIdForEvents(event)
    const composition = getComposition(inputBundle)
    const inProgress = isInProgressDeclaration(inputBundle)

    composition.identifier = {
      system: 'urn:ietf:rfc:3986',
      value: trackingId
    }

    const task = createInProgressOrReadyForReviewTask(
      findTask(inputBundle),
      event,
      trackingId,
      inProgress
    )

    const taskWithUser = setupLastRegUser(task, practitioner)

    const taskWithLocation = isEventNotification(inputBundle)
      ? await setupLastRegLocation(taskWithUser, practitioner)
      : taskWithUser

    inputBundle.entry = inputBundle.entry.map((e) => {
      if (e.resource.resourceType !== 'Task') {
        return e
      }
      return {
        ...e,
        resource: taskWithLocation
      }
    })

    const responseBundle = await sendBundleToHearth(inputBundle)
    const ok = responseBundle.entry.every((e) => e.response.status === '201')
    if (!ok) {
      throw new Error(
        'Hearth was unable to create all the entires in the bundle'
      )
    }
    const compositionLocation = responseBundle.entry
      .map((e) => e.response.location)
      .find((l) => l.includes('Composition'))

    if (!compositionLocation) {
      throw new Error('Unable to find Composition location in response bundle')
    }

    const compositionId = urlReferenceToUUID(compositionLocation)

    // fetching the new record to send to search/metrics
    const record = await getRecordById(compositionId, token, [
      'IN_PROGRESS',
      'READY_FOR_REVIEW'
    ])

    await indexBundle(record, token)
    await auditEvent(
      inProgress ? 'in-progress-declaration' : 'new-declaration',
      record,
      token
    )

    // TODO: SEND NOTIFICATION

    return {
      compositionId,
      trackingId,
      isPotentiallyDuplicate: await hasDuplicates(
        recordDetails,
        { Authorization: token },
        event
      )
    }
  } catch (error) {
    logger.error(`Workflow/createRecordHandler: error: ${error}`)
    throw new Error(error)
  }
}
