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
  ValidatedRecord,
  WaitingForValidationRecord,
  isRejected,
  isInProgress,
  isReadyForReview,
  isValidated,
  isWaitingExternalValidation,
  isComposition,
  getTaskFromSavedBundle
} from '@opencrvs/commons/types'
import {
  getToken,
  hasRegisterScope,
  hasValidateScope
} from '@workflow/utils/auth-utils'
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
import {
  findDuplicateIds,
  updateCompositionWithDuplicateIds,
  updateTaskWithDuplicateIds
} from '@workflow/utils/duplicate-checker'
import {
  generateTrackingIdForEvents,
  isHospitalNotification,
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
import {
  initiateRegistration,
  toValidated,
  toWaitingForExternalValidationState
} from '@workflow/records/state-transitions'
import { logger } from '@workflow/logger'

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
  token: string,
  duplicateIds: Array<{ id: string; trackingId: string }>
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

  const [taskWithLocation, practitionerResourcesBundle] =
    await withPractitionerDetails(task, token)

  inputBundle.entry = inputBundle.entry.map((e) => {
    if (isComposition(e.resource) && duplicateIds.length > 0) {
      logger.info(
        `Workflow/service:createRecord: ${duplicateIds.length} duplicate composition(s) found`
      )
      return {
        ...e,
        resource: updateCompositionWithDuplicateIds(e.resource, duplicateIds)
      }
    }
    if (e.resource.resourceType !== 'Task') {
      return e
    }
    return {
      ...e,
      resource: taskWithLocation
    }
  })

  const responseBundle = await sendBundleToHearth(inputBundle)
  const savedBundle = toSavedBundle(inputBundle, responseBundle)
  const record = inProgress
    ? changeState(savedBundle, 'IN_PROGRESS')
    : changeState(savedBundle, 'READY_FOR_REVIEW')

  return mergeBundles(record, practitionerResourcesBundle)
}

type CreatedRecord =
  | InProgressRecord
  | ReadyForReviewRecord
  | ValidatedRecord
  | WaitingForValidationRecord

function getEventAction(record: CreatedRecord) {
  if (isInProgress(record)) {
    return 'sent-notification'
  }
  if (isReadyForReview(record)) {
    return 'sent-notification-for-review'
  }
  if (isValidated(record)) {
    return 'sent-for-approval'
  }
  if (isWaitingExternalValidation(record)) {
    return 'waiting-external-validation'
  }
  // type assertion
  record satisfies never
  // this should never be reached
  return 'sent-notification'
}

export default async function createRecordHandler(
  request: Hapi.Request,
  _: Hapi.ResponseToolkit
) {
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
  const duplicateIds = await findDuplicateIds(
    recordDetails,
    { Authorization: token },
    event
  )
  const recordInputWithUploadedAttachments =
    await uploadBase64AttachmentsToDocumentsStore(
      recordDetails,
      getAuthHeader(request)
    )
  let record: CreatedRecord = await createRecord(
    recordInputWithUploadedAttachments,
    event,
    token,
    duplicateIds
  )

  await auditEvent(
    isInProgress(record) ? 'sent-notification' : 'sent-notification-for-review',
    record,
    token
  )

  if (duplicateIds.length) {
    await indexBundle(record, token)
    let task = getTaskFromSavedBundle(record)
    task = updateTaskWithDuplicateIds(task, duplicateIds)
    await sendBundleToHearth({
      ...record,
      entry: [{ resource: task }]
    })
    return {
      compositionId: getComposition(record).id,
      trackingId: getTrackingIdFromRecord(record),
      isPotentiallyDuplicate: true
    }
  } else if (hasValidateScope(request)) {
    record = await toValidated(record, token)
    await auditEvent('sent-for-approval', record, token)
  } else if (hasRegisterScope(request) && !isInProgress(record)) {
    record = await toWaitingForExternalValidationState(record, token)
    await auditEvent('waiting-external-validation', record, token)
  }
  const eventAction = getEventAction(record)

  // Notification not implemented for marriage yet
  // don't forward hospital notifications
  const notificationDisabled =
    isHospitalNotification(record) ||
    event === EVENT_TYPE.MARRIAGE ||
    eventAction === 'sent-for-approval' ||
    eventAction === 'waiting-external-validation' ||
    !(await isNotificationEnabled(eventAction, event, token))

  await indexBundle(record, token)

  if (!notificationDisabled) {
    await sendNotification(eventAction, record, token)
  }

  /*
   * We need to initiate registration for a
   * record in waiting validation state
   */
  if (isWaitingExternalValidation(record)) {
    const rejectedOrWaitingValidationRecord = await initiateRegistration(
      record,
      request.headers,
      token
    )

    if (isRejected(rejectedOrWaitingValidationRecord)) {
      await indexBundle(rejectedOrWaitingValidationRecord, token)
      await auditEvent('sent-for-updates', record, token)
    }
  }

  return {
    compositionId: getComposition(record).id,
    trackingId: getTrackingIdFromRecord(record),
    isPotentiallyDuplicate: false
  }
}
