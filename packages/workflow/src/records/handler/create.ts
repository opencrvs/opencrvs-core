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

import { logger } from '@opencrvs/commons'
import {
  getAuthorizationHeaderFromToken,
  PlainToken,
  toTokenWithBearer
} from '@opencrvs/commons/http'
import {
  BirthRegistration,
  buildFHIRBundle,
  Bundle,
  changeState,
  DeathRegistration,
  Encounter,
  EVENT_TYPE,
  findEncounterFromRecord,
  getComposition,
  getCompositionIdFromTask,
  getTaskFromSavedBundle,
  getTrackingId as getTrackingIdFromRecord,
  InProgressRecord,
  isComposition,
  isInProgress,
  isReadyForReview,
  isTask,
  isValidated,
  isWaitingExternalValidation,
  Location,
  MarriageRegistration,
  ReadyForReviewRecord,
  Saved,
  StateIdenfitiers,
  ValidatedRecord,
  WaitingForValidationRecord
} from '@opencrvs/commons/types'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import {
  generateTrackingIdForEvents,
  isInProgressDeclaration
} from '@workflow/features/registration/utils'
import {
  createUserAuditEvent,
  writeMetricsEvent
} from '@workflow/records/audit'
import {
  findTaskFromIdentifier,
  getLocationsById,
  mergeBundles,
  sendBundleToHearth,
  toSavedBundle,
  withPractitionerDetails
} from '@workflow/records/fhir'

import { useExternalValidationQueue } from '@opencrvs/commons/message-queue'
import { REDIS_HOST } from '@workflow/constants'
import { getRecordById } from '@workflow/records'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { indexBundleWithTransaction } from '@workflow/records/search'
import {
  toValidated,
  toWaitingForExternalValidationState
} from '@workflow/records/state-transitions'
import {
  findDuplicateIds,
  hasSameDuplicatesInExtension,
  updateCompositionWithDuplicateIds,
  updateTaskWithDuplicateIds
} from '@workflow/utils/duplicate-checker'
import { z } from 'zod'

const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  record: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >()
})

const { sendForExternalValidation } = useExternalValidationQueue(REDIS_HOST)

function findTask(bundle: Bundle) {
  const task = bundle.entry.map((e) => e.resource).find(isTask)
  if (!task) {
    throw new Error('Task not found in bundle')
  }
  return task
}

async function findExistingComposition<T extends Array<keyof StateIdenfitiers>>(
  draftId: string,
  token: PlainToken,
  allowedStates: T
) {
  const taskBundle = await findTaskFromIdentifier(draftId)

  if (taskBundle.entry.length > 0) {
    const compositionId = getCompositionIdFromTask(taskBundle.entry[0].resource)

    return getRecordById(
      compositionId,
      toTokenWithBearer(token),
      allowedStates,
      false
    )
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

async function resolveLocationsForEncounter(
  encounter: Encounter
): Promise<Bundle<Location> | null> {
  if (encounter.location == null) {
    return null
  }
  const locationIds: Array<string> = []
  for (const { location } of encounter.location) {
    locationIds.push(location.reference.split('/')[1])
  }
  return getLocationsById(locationIds)
}

function bundleIncludesLocationResources(record: Saved<Bundle>) {
  const encounter = findEncounterFromRecord(record)
  const encounterLocationIds =
    encounter?.location?.map(
      ({ location }) => location.reference.split('/')[1]
    ) || []

  const bundleLocations = record.entry.filter(
    ({ resource }) => resource.resourceType == 'Location'
  )

  return encounterLocationIds.every((locationId) =>
    bundleLocations.some((location) => location.id === locationId)
  )
}

type CreatedRecord =
  | InProgressRecord
  | ReadyForReviewRecord
  | ValidatedRecord
  | WaitingForValidationRecord

async function createRecord<T = InProgressRecord | ReadyForReviewRecord>(
  recordDetails: z.TypeOf<typeof requestSchema>['record'],
  event: z.TypeOf<typeof requestSchema>['event'],
  token: string,
  duplicateIds: Array<{ id: string; trackingId: string }>
): Promise<T> {
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

  const mergedBundle = mergeBundles(savedBundle, practitionerResourcesBundle)

  const encounter = findEncounterFromRecord(savedBundle)
  if (encounter == null) {
    return mergedBundle as T
  }

  if (bundleIncludesLocationResources(savedBundle)) {
    return mergedBundle as T
  }

  const locationResourcesBundle = await resolveLocationsForEncounter(encounter)

  if (locationResourcesBundle == null) {
    return mergedBundle as T
  }

  return mergeBundles(mergedBundle, locationResourcesBundle) as T
}

function getEventAction(record: ValidatedRecord): 'sent-for-approval'
function getEventAction(
  record: InProgressRecord | ReadyForReviewRecord
): 'sent-notification' | 'sent-notification-for-review'
function getEventAction(
  record: ReadyForReviewRecord
): 'sent-notification-for-review'
function getEventAction(
  record: WaitingForValidationRecord
): 'waiting-external-validation'
function getEventAction(record: CreatedRecord) {
  if (isInProgress(record)) {
    return 'sent-notification' as const
  }
  if (isReadyForReview(record)) {
    return 'sent-notification-for-review' as const
  }
  if (isValidated(record)) {
    return 'sent-for-approval' as const
  }
  if (isWaitingExternalValidation(record)) {
    return 'waiting-external-validation' as const
  }
  // type assertion
  record satisfies never
  // this should never be reached
  return 'sent-notification' as const
}

export async function declareRecordHandler(
  recordDetails: BirthRegistration | DeathRegistration | MarriageRegistration,
  event: EVENT_TYPE,
  token: PlainToken
) {
  const transactionId = `declare_${recordDetails.registration?.draftId}`
  const recordInputWithUploadedAttachments =
    await uploadBase64AttachmentsToDocumentsStore(
      recordDetails,
      getAuthorizationHeaderFromToken(token)
    )

  const draftId = recordDetails.registration?.draftId

  const existingComposition = draftId
    ? await findExistingComposition(draftId, token, [
        'READY_FOR_REVIEW',
        'IN_PROGRESS'
      ])
    : null

  const duplicateIds = await findDuplicateIds(
    recordDetails,
    { Authorization: token },
    event,
    transactionId,
    existingComposition ? getComposition(existingComposition).id : undefined
  )

  const declaredRecord = existingComposition
    ? existingComposition
    : await createRecord<ReadyForReviewRecord | InProgressRecord>(
        recordInputWithUploadedAttachments,
        event,
        token,
        duplicateIds
      )

  await writeMetricsEvent(
    isInProgressDeclaration(declaredRecord)
      ? 'sent-notification'
      : 'sent-notification-for-review',
    {
      record: declaredRecord,
      authToken: token,
      transactionId
    }
  )

  await createUserAuditEvent(
    isInProgressDeclaration(declaredRecord) ? 'IN_PROGRESS' : 'DECLARED',
    {
      transactionId: transactionId,
      compositionId: getComposition(declaredRecord).id,
      trackingId: getTrackingIdFromRecord(declaredRecord),
      headers: getAuthorizationHeaderFromToken(token)
    }
  )

  if (duplicateIds.length > 0) {
    if (
      /*
       * This check is so that we don't write new Task_history
       * items for the task even when it wouldn't otherwise change
       */
      !hasSameDuplicatesInExtension(
        getTaskFromSavedBundle(declaredRecord),
        duplicateIds
      )
    ) {
      const task = updateTaskWithDuplicateIds(
        getTaskFromSavedBundle(declaredRecord),
        duplicateIds
      )

      await sendBundleToHearth({
        ...declaredRecord,
        entry: [{ resource: task }]
      })
    }
    await indexBundleWithTransaction(declaredRecord, token, transactionId)

    return
  }

  await indexBundleWithTransaction(declaredRecord, token, transactionId)

  const action = getEventAction(declaredRecord)
  const notificationDisabled = !(await isNotificationEnabled(
    action,
    event,
    token
  ))

  if (!notificationDisabled) {
    await sendNotification(action, declaredRecord, token)
  }
}

export async function validateRecordHandler(
  recordDetails: BirthRegistration | DeathRegistration | MarriageRegistration,
  event: EVENT_TYPE,
  token: PlainToken
) {
  const transactionId = `validate_${recordDetails.registration?.draftId}`

  const recordInputWithUploadedAttachments =
    await uploadBase64AttachmentsToDocumentsStore(
      recordDetails,
      getAuthorizationHeaderFromToken(token)
    )

  const draftId = recordDetails.registration?.draftId

  const existingComposition = draftId
    ? await findExistingComposition(draftId, token, [
        'READY_FOR_REVIEW',
        'VALIDATED'
      ])
    : null

  const duplicateIds = await findDuplicateIds(
    recordDetails,
    { Authorization: token },
    event,
    transactionId,
    existingComposition ? getComposition(existingComposition).id : undefined
  )

  const declaredRecord = existingComposition
    ? existingComposition
    : /*
       * There is an assumption here that a user with a register scope will
       * never register an incomplete record
       */
      await createRecord<ReadyForReviewRecord>(
        recordInputWithUploadedAttachments,
        event,
        token,
        duplicateIds
      )

  const readyForReviewRecord = changeState(declaredRecord, 'READY_FOR_REVIEW')

  await writeMetricsEvent('sent-notification-for-review', {
    record: readyForReviewRecord,
    authToken: token,
    transactionId
  })

  await createUserAuditEvent('DECLARED', {
    transactionId: transactionId,
    compositionId: getComposition(readyForReviewRecord).id,
    trackingId: getTrackingIdFromRecord(readyForReviewRecord),
    headers: getAuthorizationHeaderFromToken(token)
  })

  if (duplicateIds.length > 0) {
    if (
      /*
       * This check is so that we don't write new Task_history
       * items for the task even when it wouldn't otherwise change
       */
      !hasSameDuplicatesInExtension(
        getTaskFromSavedBundle(readyForReviewRecord),
        duplicateIds
      )
    ) {
      const task = updateTaskWithDuplicateIds(
        getTaskFromSavedBundle(readyForReviewRecord),
        duplicateIds
      )

      await sendBundleToHearth({
        ...readyForReviewRecord,
        entry: [{ resource: task }]
      })
    }

    await indexBundleWithTransaction(readyForReviewRecord, token, transactionId)

    return
  }

  /*
   * You might think, how could validatedRecord be in anything else than READY_FOR_REVIEW state?
   * If the transaction failed earlier after this point in code
   */
  const validatedRecord = isReadyForReview(readyForReviewRecord)
    ? await toValidated(readyForReviewRecord, token)
    : readyForReviewRecord

  await createUserAuditEvent('VALIDATED', {
    transactionId: transactionId,
    compositionId: getComposition(validatedRecord).id,
    trackingId: getTrackingIdFromRecord(validatedRecord),
    headers: getAuthorizationHeaderFromToken(token)
  })

  await writeMetricsEvent('sent-for-approval', {
    record: validatedRecord,
    authToken: token,
    transactionId: transactionId
  })

  await indexBundleWithTransaction(validatedRecord, token, transactionId)

  const action = getEventAction(validatedRecord)
  const notificationDisabled = !(await isNotificationEnabled(
    action,
    event,
    token
  ))

  if (!notificationDisabled) {
    await sendNotification(action, declaredRecord, token)
  }
}

export async function registerRecordHandler(
  recordDetails: BirthRegistration | DeathRegistration | MarriageRegistration,
  event: EVENT_TYPE,
  token: PlainToken
) {
  const transactionId = `register_${recordDetails.registration?.draftId}`
  const recordInputWithUploadedAttachments =
    await uploadBase64AttachmentsToDocumentsStore(
      recordDetails,
      getAuthorizationHeaderFromToken(token)
    )

  const draftId = recordDetails.registration?.draftId

  const existingComposition = draftId
    ? await findExistingComposition(draftId, token, [
        'VALIDATED',
        'DECLARED',
        'WAITING_VALIDATION'
      ])
    : null

  const duplicateIds = await findDuplicateIds(
    recordDetails,
    { Authorization: token },
    event,
    transactionId,
    existingComposition ? getComposition(existingComposition).id : undefined
  )

  const declaredRecord = existingComposition
    ? existingComposition
    : /*
       * There is an assumption here that a user with a register scope will
       * never register an incomplete record
       */
      await createRecord<ReadyForReviewRecord>(
        recordInputWithUploadedAttachments,
        event,
        token,
        duplicateIds
      )

  const validatedRecord = changeState(declaredRecord, 'READY_FOR_REVIEW')

  await writeMetricsEvent('sent-notification-for-review', {
    record: validatedRecord,
    authToken: token,
    transactionId
  })

  await createUserAuditEvent('DECLARED', {
    transactionId: transactionId,
    compositionId: getComposition(validatedRecord).id,
    trackingId: getTrackingIdFromRecord(validatedRecord),
    headers: getAuthorizationHeaderFromToken(token)
  })

  if (duplicateIds.length > 0) {
    if (
      /*
       * This check is so that we don't write new Task_history
       * items for the task even when it wouldn't otherwise change
       */
      !hasSameDuplicatesInExtension(
        getTaskFromSavedBundle(validatedRecord),
        duplicateIds
      )
    ) {
      const task = updateTaskWithDuplicateIds(
        getTaskFromSavedBundle(validatedRecord),
        duplicateIds
      )

      await sendBundleToHearth({
        ...validatedRecord,
        entry: [{ resource: task }]
      })
    }

    await indexBundleWithTransaction(validatedRecord, token, transactionId)

    return
  }

  /*
   * You might think, how could validatedRecord be in anything else than READY_FOR_REVIEW state?
   * If the transaction failed earlier after this point in code
   */
  const record = isReadyForReview(validatedRecord)
    ? await toWaitingForExternalValidationState(validatedRecord, token)
    : validatedRecord

  await createUserAuditEvent('REGISTERED', {
    transactionId: transactionId,
    compositionId: getComposition(record).id,
    trackingId: getTrackingIdFromRecord(record),
    headers: getAuthorizationHeaderFromToken(token)
  })

  await writeMetricsEvent('waiting-external-validation', {
    record: record,
    authToken: token,
    transactionId: transactionId
  })

  await indexBundleWithTransaction(record, token, transactionId)

  await sendForExternalValidation({
    record,
    token
  })
}
