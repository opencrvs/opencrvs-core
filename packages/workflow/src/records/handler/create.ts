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
  getTrackingId as getTrackingIdFromRecord,
  isTask,
  changeState,
  InProgressRecord,
  ReadyForReviewRecord,
  resourceToSavedBundleEntry
} from '@opencrvs/commons/types'
import { logger } from '@workflow/logger'
import { getToken } from '@workflow/utils/authUtils'
import {
  findTaskFromIdentifier,
  mergeBundles,
  sendBundleToHearth,
  toSavedBundle,
  withPractitionerDetails
} from '@workflow/records/fhir'
import { z } from 'zod'
import { indexBundle } from '@workflow/records/search'
import { validateRequest } from '@workflow/utils'
import { hasDuplicates } from '@workflow/utils/duplicateChecker'
import {
  generateTrackingIdForEvents,
  isEventNotification,
  isInProgressDeclaration
} from '@workflow/features/registration/utils'
import { auditEvent } from '@workflow/records/audit'
import { getTrackingId } from '@workflow/features/registration/fhir/fhir-utils'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import { getAuthHeader } from '@opencrvs/commons/http'

const requestSchema = z.object({
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
  trackingId: Awaited<ReturnType<typeof generateTrackingIdForEvents>>,
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

async function createRecord(
  recordDetails: z.TypeOf<typeof requestSchema>['record'],
  event: z.TypeOf<typeof requestSchema>['event'],
  token: string
): Promise<InProgressRecord | ReadyForReviewRecord> {
  const inputBundle = buildFHIRBundle(recordDetails, event)
  const trackingId = await generateTrackingIdForEvents(
    event,
    inputBundle,
    token
  )
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

  const [taskWithLocation, ...practitionerResources] =
    await withPractitionerDetails(task, token)

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
  const savedBundle = await toSavedBundle(inputBundle, responseBundle)
  const practitionerResourcesBundle = {
    type: 'document',
    resourceType: 'Bundle',
    entry: practitionerResources.map(resourceToSavedBundleEntry)
  } satisfies Bundle
  const record = inProgress
    ? changeState(savedBundle, 'IN_PROGRESS')
    : changeState(savedBundle, 'READY_FOR_REVIEW')

  return mergeBundles(record, practitionerResourcesBundle)
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
    const isPotentiallyDuplicate = await hasDuplicates(
      recordDetails,
      { Authorization: token },
      event
    )
    const recordInputWithUploadedAttachments =
      await uploadBase64AttachmentsToDocumentsStore(
        recordDetails,
        getAuthHeader(request)
      )
    const record = await createRecord(
      recordInputWithUploadedAttachments,
      event,
      token
    )
    const inProgress = isInProgressDeclaration(record)
    const eventNotification = isEventNotification(record)

    await indexBundle(record, token)
    await auditEvent(
      inProgress ? 'in-progress-declaration' : 'new-declaration',
      record,
      token
    )

    // Notification not implemented for marriage yet
    // don't forward hospital notifications
    if (
      event !== EVENT_TYPE.MARRIAGE &&
      !eventNotification &&
      (await isNotificationEnabled(
        inProgress ? 'in-progress' : 'ready-for-review',
        event,
        token
      ))
    ) {
      await sendNotification(
        inProgress ? 'in-progress' : 'ready-for-review',
        record,
        token
      )
    }

    return {
      compositionId: getComposition(record).id,
      trackingId: getTrackingIdFromRecord(record),
      isPotentiallyDuplicate
    }
  } catch (error) {
    logger.error(`Workflow/createRecordHandler: error: ${error}`)
    throw new Error(error)
  }
}
