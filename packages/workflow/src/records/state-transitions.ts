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
  BundleEntry,
  CertifiedRecord,
  changeState,
  CorrectionRequestedRecord,
  Extension,
  findExtension,
  getCorrectionRequestedTask,
  getTaskFromSavedBundle,
  IssuedRecord,
  isPaymentReconciliationBundleEntry,
  PaymentReconciliation,
  Practitioner,
  RegisteredRecord,
  Task,
  sortTasksDescending,
  RecordWithPreviousTask,
  ValidatedRecord,
  Attachment,
  InProgressRecord,
  ReadyForReviewRecord,
  Encounter,
  SavedBundleEntry,
  CompositionSection,
  DocumentReference,
  Composition,
  RelatedPerson,
  Patient,
  ValidRecord,
  Bundle,
  SavedTask,
  ArchivedRecord,
  RegistrationStatus,
  WaitingForValidationRecord,
  EVENT_TYPE,
  getComposition,
  RegistrationNumber,
  resourceToBundleEntry,
  toHistoryResource,
  TaskHistory,
  RejectedRecord,
  Location
} from '@opencrvs/commons/types'
import { getUUID } from '@opencrvs/commons'
import {
  REG_NUMBER_SYSTEM,
  SECTION_CODE
} from '@workflow/features/events/utils'
import {
  invokeRegistrationValidation,
  setupLastRegLocation,
  setupLastRegUser,
  updatePatientIdentifierWithRN,
  validateDeceasedDetails
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { IEventRegistrationCallbackPayload } from '@workflow/features/registration/handler'
import { ASSIGNED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import {
  getTaskEventType,
  removeDuplicatesFromComposition
} from '@workflow/features/task/fhir/utils'
import {
  CertifyInput,
  IssueInput,
  ApproveRequestInput,
  CorrectionRejectionInput,
  CorrectionRequestInput,
  MakeCorrectionRequestInput,
  ChangedValuesInput
} from './validations'
import {
  createArchiveTask,
  createCorrectedTask,
  createCorrectionEncounter,
  createPaymentResources,
  createCorrectionProofOfLegalCorrectionDocument,
  createCorrectionRequestTask,
  createDownloadTask,
  createDuplicateTask,
  createNotDuplicateTask,
  createRegisterTask,
  createRejectTask,
  createUnassignedTask,
  createUpdatedTask,
  createValidateTask,
  createViewTask,
  createVerifyRecordTask,
  createWaitingForValidationTask,
  getTaskHistory,
  createRelatedPersonEntries,
  createDocumentReferenceEntryForCertificate,
  createIssuedTask,
  createCertifiedTask,
  withPractitionerDetails,
  mergeChangedResourcesIntoRecord
} from '@workflow/records/fhir'
import { ISystemModelData, IUserModelData } from '@workflow/records/user'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { REG_NUMBER_GENERATION_FAILED } from '@workflow/features/registration/fhir/constants'

export async function toCorrected(
  record: RegisteredRecord | CertifiedRecord | IssuedRecord,
  practitioner: Practitioner,
  correctionDetails: MakeCorrectionRequestInput,
  proofOfLegalCorrectionAttachments: Attachment[],
  paymentAttachmentURL?: string
): Promise<RegisteredRecord> {
  const previousTask = getTaskFromSavedBundle(record)

  let correctionPaymentBundleEntries: BundleEntry[] = []

  if (correctionDetails.payment) {
    correctionPaymentBundleEntries = createPaymentResources(
      correctionDetails.payment,
      paymentAttachmentURL
    )
  }

  const correctionEncounter = createCorrectionEncounter()
  const otherDocumentReferences = proofOfLegalCorrectionAttachments.map(
    (attachment) =>
      createCorrectionProofOfLegalCorrectionDocument(
        correctionEncounter.fullUrl,
        attachment.data!,
        attachment.type!
      )
  )

  const paymentReconciliation = correctionPaymentBundleEntries.find(
    isPaymentReconciliationBundleEntry
  )

  const correctedTask = createCorrectedTask(
    previousTask,
    correctionDetails,
    correctionEncounter,
    paymentReconciliation
  )

  const correctionRequestTaskWithPractitionerExtensions = setupLastRegUser(
    correctedTask,
    practitioner
  )

  const correctionRequestWithLocationExtensions = await setupLastRegLocation(
    correctionRequestTaskWithPractitionerExtensions,
    practitioner
  )

  const newEntries = [
    ...record.entry.filter((entry) => entry.resource.id !== previousTask.id),
    ...correctionPaymentBundleEntries,
    ...otherDocumentReferences,
    correctionEncounter,
    { resource: correctionRequestWithLocationExtensions }
  ]

  const updatedRecord = {
    ...record,
    entry: newEntries
  }

  return changeState(updatedRecord, 'REGISTERED')
}

export async function toCorrectionApproved(
  record: CorrectionRequestedRecord,
  practitioner: Practitioner,
  correctionDetails: ApproveRequestInput
): Promise<RecordWithPreviousTask<RegisteredRecord>> {
  const currentCorrectionRequestedTask = getCorrectionRequestedTask(record)

  const correctionAcceptedTask: Task = {
    ...currentCorrectionRequestedTask,
    status: 'accepted',
    extension: extensionsWithoutAssignment(
      currentCorrectionRequestedTask.extension
    )
  }

  const correctionEncounter = record.entry.find(
    (resource): resource is SavedBundleEntry<Encounter> =>
      resource.resource.id ===
      currentCorrectionRequestedTask.encounter.reference.split('/')[1]
  )
  if (!correctionEncounter) {
    throw new Error('No correction encounter found')
  }

  const correctionPaymentId = findExtension(
    'http://opencrvs.org/specs/extension/paymentDetails',
    currentCorrectionRequestedTask.extension
  )

  const paymentReconciliation = correctionPaymentId
    ? record.entry.find(
        (resource): resource is SavedBundleEntry<PaymentReconciliation> =>
          resource.resource.id ===
          correctionPaymentId.valueReference.reference.split('/')[1]
      )
    : undefined

  const correctedTask = createCorrectedTask(
    correctionAcceptedTask,
    correctionDetails,
    correctionEncounter,
    paymentReconciliation
  )

  const correctionRequestTaskWithPractitionerExtensions = setupLastRegUser(
    correctedTask,
    practitioner
  )

  const correctionRequestWithLocationExtensions = await setupLastRegLocation(
    correctionRequestTaskWithPractitionerExtensions,
    practitioner
  )

  return changeState(
    {
      ...record,
      entry: [
        ...record.entry.filter(
          (entry) => entry.resource.id !== correctionAcceptedTask.id
        ),
        { resource: correctionAcceptedTask },
        { resource: correctionRequestWithLocationExtensions }
      ]
    },
    'REGISTERED'
  ) as any as RecordWithPreviousTask<RegisteredRecord>
}

export async function toUpdated(
  record: InProgressRecord | ReadyForReviewRecord,
  token: string,
  updatedDetails: ChangedValuesInput
): Promise<InProgressRecord | ReadyForReviewRecord> {
  const practitioner = await getLoggedInPractitionerResource(token)
  const previousTask = getTaskFromSavedBundle(record)

  const updatedTaskWithoutPractitionerExtensions = createUpdatedTask(
    previousTask,
    updatedDetails,
    practitioner
  )

  const [updatedTask, practitionerResourcesBundle] =
    await withPractitionerDetails(
      updatedTaskWithoutPractitionerExtensions,
      token
    )

  const recordWithUpdatedTask = {
    ...record,
    entry: [
      ...record.entry.map((entry) => {
        if (entry.resource.id !== previousTask.id) {
          return entry
        }
        return {
          ...entry,
          resource: updatedTask
        }
      })
    ]
  }

  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      recordWithUpdatedTask,
      practitionerResourcesBundle
    ),
    ['IN_PROGRESS', 'READY_FOR_REVIEW']
  )
}

export async function toViewed<T extends ValidRecord>(
  record: T,
  user: IUserModelData,
  office: Location
): Promise<T> {
  const previousTask: SavedTask = getTaskFromSavedBundle(record)
  const viewedTask = await createViewTask(previousTask, user, office)

  const taskHistoryEntry = resourceToBundleEntry(
    toHistoryResource(previousTask)
  ) as SavedBundleEntry<TaskHistory>

  const filteredEntries = record.entry.filter(
    (e) => e.resource.resourceType !== 'Task'
  )

  const viewedRecord = {
    resourceType: 'Bundle' as const,
    type: 'document' as const,
    entry: [
      ...filteredEntries,
      {
        fullUrl: record.entry.filter(
          (e) => e.resource.resourceType === 'Task'
        )[0].fullUrl,
        resource: viewedTask
      },
      taskHistoryEntry
    ]
  } as T

  return viewedRecord
}

export async function toDownloaded(
  record: ValidRecord,
  user: IUserModelData | ISystemModelData,
  extensionUrl:
    | 'http://opencrvs.org/specs/extension/regDownloaded'
    | 'http://opencrvs.org/specs/extension/regAssigned'
) {
  const previousTask = getTaskFromSavedBundle(record)

  const downloadedTask = await createDownloadTask(
    previousTask,
    user,
    extensionUrl
  )

  // this is to show the latest action in history
  // as all histories are read from task history
  const taskHistoryEntry = resourceToBundleEntry(
    toHistoryResource(previousTask)
  ) as SavedBundleEntry<TaskHistory>

  const downloadedRecord = {
    ...record,
    entry: [
      ...record.entry.filter((entry) => entry.resource.id !== previousTask.id),
      { resource: downloadedTask }
    ].concat(taskHistoryEntry)
  }

  const downloadedRecordWithTaskOnly: Bundle<SavedTask> = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [{ resource: downloadedTask }]
  }

  return { downloadedRecord, downloadedRecordWithTaskOnly }
}

export async function toRejected(
  record:
    | ReadyForReviewRecord
    | ValidatedRecord
    | InProgressRecord
    | WaitingForValidationRecord,
  token: string,
  comment: fhir3.CodeableConcept,
  reason?: string
): Promise<RejectedRecord> {
  const practitioner = await getLoggedInPractitionerResource(token)
  const previousTask = getTaskFromSavedBundle(record)
  const taskWithoutPracitionerExtensions = createRejectTask(
    previousTask,
    practitioner,
    comment,
    reason
  )

  const [rejectedTask, practitionerResourcesBundle] =
    await withPractitionerDetails(taskWithoutPracitionerExtensions, token)

  const unsavedChangedResources: Bundle = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [{ resource: rejectedTask }]
  }

  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      unsavedChangedResources,
      practitionerResourcesBundle
    ),
    'REJECTED'
  )
}

export async function toWaitingForExternalValidationState(
  record: ReadyForReviewRecord | ValidatedRecord,
  token: string,
  comments?: string,
  timeLoggedMS?: number
): Promise<WaitingForValidationRecord> {
  const practitioner = await getLoggedInPractitionerResource(token)
  const previousTask = getTaskFromSavedBundle(record)
  const taskWithoutPractitonerExtensions = createWaitingForValidationTask(
    previousTask,
    practitioner,
    comments,
    timeLoggedMS
  )

  const [waitingExternalValidationTask, practitionerResourcesBundle] =
    await withPractitionerDetails(taskWithoutPractitonerExtensions, token)

  const unsavedChangedResources: Bundle = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [{ resource: waitingExternalValidationTask }]
  }

  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      unsavedChangedResources,
      practitionerResourcesBundle
    ),
    'WAITING_VALIDATION'
  )
}

export async function initiateRegistration(
  record: WaitingForValidationRecord,
  headers: Record<string, string>,
  token: string
): Promise<WaitingForValidationRecord | RejectedRecord> {
  try {
    await invokeRegistrationValidation(record, headers)
  } catch (error) {
    const statusReason: fhir3.CodeableConcept = {
      text: REG_NUMBER_GENERATION_FAILED
    }
    return toRejected(record, token, statusReason)
  }
  return record
}

export async function toRegistered(
  request: Hapi.Request,
  record: WaitingForValidationRecord,
  practitioner: Practitioner,
  registrationNumber: IEventRegistrationCallbackPayload['registrationNumber'],
  token: string,
  childIdentifiers?: IEventRegistrationCallbackPayload['childIdentifiers']
): Promise<RegisteredRecord> {
  const previousTask = getTaskFromSavedBundle(record)
  const registeredTaskWithoutPractitionerExtensions = createRegisterTask(
    previousTask,
    practitioner
  )

  const [registeredTask, practitionerResourcesBundle] =
    await withPractitionerDetails(
      registeredTaskWithoutPractitionerExtensions,
      token
    )

  const event = getTaskEventType(registeredTask) as EVENT_TYPE
  const composition = getComposition(record)
  // for patient entries of child, deceased, bride, groom
  const patientsWithRegNumber = updatePatientIdentifierWithRN(
    record,
    composition,
    SECTION_CODE[event],
    REG_NUMBER_SYSTEM[event],
    registrationNumber
  )

  /* Setting registration number here */
  const system = `http://opencrvs.org/specs/id/${
    event.toLowerCase() as Lowercase<typeof event>
  }-registration-number` as const

  registeredTask.identifier.push({
    system,
    value: registrationNumber as RegistrationNumber
  })

  if (event === EVENT_TYPE.BIRTH && childIdentifiers) {
    // For birth event patients[0] is child and it should
    // already be initialized with the RN identifier
    childIdentifiers.forEach((childIdentifier) => {
      const previousIdentifier = patientsWithRegNumber[0].identifier!.find(
        ({ type }) => type?.coding?.[0].code === childIdentifier.type
      )
      if (!previousIdentifier) {
        patientsWithRegNumber[0].identifier!.push({
          type: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/identifier-type',
                code: childIdentifier.type
              }
            ]
          },
          value: childIdentifier.value
        })
      } else {
        previousIdentifier.value = childIdentifier.value
      }
    })
  }

  if (event === EVENT_TYPE.DEATH) {
    /** using first patient because for death event there is only one patient */
    patientsWithRegNumber[0] = await validateDeceasedDetails(
      patientsWithRegNumber[0],
      {
        Authorization: request.headers.authorization
      }
    )
  }

  const patientIds = patientsWithRegNumber.map((p) => p.id)
  const patientsEntriesWithRN = record.entry.filter((e) =>
    patientIds.includes(e.resource.id)
  )

  const unsavedChangedResources: Bundle = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [...patientsEntriesWithRN, { resource: registeredTask }]
  }

  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      unsavedChangedResources,
      practitionerResourcesBundle
    ),
    'REGISTERED'
  )
}

export async function toArchived(
  record: RegisteredRecord | ReadyForReviewRecord | ValidatedRecord,
  practitioner: Practitioner,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
) {
  const previousTask = getTaskFromSavedBundle(record)
  const archivedTask = createArchiveTask(
    previousTask,
    practitioner,
    reason,
    comment,
    duplicateTrackingId
  )

  const archivedTaskWithPractitionerExtensions = setupLastRegUser(
    archivedTask,
    practitioner
  )

  const archivedTaskWithLocationExtensions = await setupLastRegLocation(
    archivedTaskWithPractitionerExtensions,
    practitioner
  )

  const archivedRecordWithTaskOnly: Bundle<SavedTask> = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [{ resource: archivedTaskWithLocationExtensions }]
  }

  const archivedRecord = changeState(
    {
      ...record,
      entry: [
        ...record.entry.filter((e) => e.resource.id !== archivedTask.id),
        { resource: archivedTaskWithLocationExtensions }
      ]
    },
    'ARCHIVED'
  )

  return { archivedRecord, archivedRecordWithTaskOnly }
}

export async function toReinstated(
  record: ArchivedRecord,
  prevRegStatus: RegistrationStatus,
  practitioner: Practitioner
): Promise<ValidatedRecord | ReadyForReviewRecord> {
  const previousTask = getTaskFromSavedBundle(record)
  const reinstatedTask: SavedTask = {
    ...previousTask,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/regReinstated'
      }
    ],
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: prevRegStatus
        }
      ]
    }
  }

  const reinstatedTaskWithPractitionerExtensions = setupLastRegUser(
    reinstatedTask,
    practitioner
  )

  const reinstatedTaskWithLocationExtensions = await setupLastRegLocation(
    reinstatedTaskWithPractitionerExtensions,
    practitioner
  )

  const newEntries = [
    ...record.entry.map((entry) => {
      if (entry.resource.id !== previousTask.id) {
        return entry
      }
      return {
        ...entry,
        resource: reinstatedTaskWithLocationExtensions
      }
    })
  ]

  return changeState(
    {
      ...record,
      entry: newEntries
    },
    ['READY_FOR_REVIEW', 'VALIDATED']
  )
}

export async function toDuplicated(
  record: ReadyForReviewRecord | ValidatedRecord,
  practitioner: Practitioner,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
): Promise<{
  duplicatedRecord: ReadyForReviewRecord | ValidatedRecord
  duplicatedRecordWithTaskOnly: Bundle<SavedTask>
}> {
  const previousTask = getTaskFromSavedBundle(record)
  const duplicatedTask = createDuplicateTask(
    previousTask,
    practitioner,
    reason,
    comment,
    duplicateTrackingId
  )

  const duplicatedTaskWithPractitionerExtensions = setupLastRegUser(
    duplicatedTask,
    practitioner
  )

  const duplicatedTaskWithLocationExtensions = await setupLastRegLocation(
    duplicatedTaskWithPractitionerExtensions,
    practitioner
  )

  const duplicatedRecordWithTaskOnly: Bundle<SavedTask> = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [{ resource: duplicatedTaskWithLocationExtensions }]
  }

  const duplicatedRecord = {
    ...record,
    entry: [
      ...record.entry.filter((e) => e.resource.id !== duplicatedTask.id),
      { resource: duplicatedTaskWithLocationExtensions }
    ]
  } as ReadyForReviewRecord

  return { duplicatedRecord, duplicatedRecordWithTaskOnly }
}

export async function toNotDuplicated(
  record: ReadyForReviewRecord,
  token: string
): Promise<ValidRecord> {
  const previousTask = getTaskFromSavedBundle(record)
  const practitioner = await getLoggedInPractitionerResource(token)
  const taskWithoutPractitionerExtensions = createNotDuplicateTask(
    previousTask,
    practitioner.id
  )

  const [notDuplicateTask, practitionerResourcesBundle] =
    await withPractitionerDetails(taskWithoutPractitionerExtensions, token)

  const updatedComposition = removeDuplicatesFromComposition(
    getComposition(record)
  )

  const changedResources: Bundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [{ resource: updatedComposition }, { resource: notDuplicateTask }]
  }

  const notDuplicateBundle = await mergeChangedResourcesIntoRecord(
    record,
    changedResources,
    practitionerResourcesBundle
  )

  return notDuplicateBundle
}

export async function toValidated(
  record: InProgressRecord | ReadyForReviewRecord,
  token: string,
  comments?: string,
  timeLoggedMS?: number
): Promise<ValidatedRecord> {
  const practitioner = await getLoggedInPractitionerResource(token)
  const previousTask = getTaskFromSavedBundle(record)
  const taskWithoutPractitionerExtensions = createValidateTask(
    previousTask,
    practitioner,
    comments,
    timeLoggedMS
  )

  const [validatedTask, practitionerResourcesBundle] =
    await withPractitionerDetails(taskWithoutPractitionerExtensions, token)

  const unsavedChangedResources: Bundle = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [{ resource: validatedTask }]
  }

  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      unsavedChangedResources,
      practitionerResourcesBundle
    ),
    'VALIDATED'
  )
}

export async function toCorrectionRequested(
  record: RegisteredRecord | CertifiedRecord | IssuedRecord,
  practitioner: Practitioner,
  correctionDetails: CorrectionRequestInput,
  proofOfLegalCorrectionAttachments: Array<{ type: string; url: string }>,
  paymentAttachmentURL?: string
): Promise<CorrectionRequestedRecord> {
  const previousTask = getTaskFromSavedBundle(record)

  let correctionPaymentBundleEntries: BundleEntry[] = []

  if (correctionDetails.payment) {
    correctionPaymentBundleEntries = createPaymentResources(
      correctionDetails.payment,
      paymentAttachmentURL
    )
  }

  const correctionEncounter = createCorrectionEncounter()
  const otherDocumentReferences = proofOfLegalCorrectionAttachments.map(
    (attachment) =>
      createCorrectionProofOfLegalCorrectionDocument(
        correctionEncounter.fullUrl,
        attachment.url,
        attachment.type
      )
  )

  const paymentReconciliation = correctionPaymentBundleEntries.find(
    isPaymentReconciliationBundleEntry
  )

  const correctionRequestTask = createCorrectionRequestTask(
    previousTask,
    correctionDetails,
    correctionEncounter,
    practitioner,
    paymentReconciliation
  )

  const correctionRequestTaskWithPractitionerExtensions = setupLastRegUser(
    correctionRequestTask,
    practitioner
  )

  const correctionRequestWithLocationExtensions = await setupLastRegLocation(
    correctionRequestTaskWithPractitionerExtensions,
    practitioner
  )

  return changeState(
    {
      ...record,
      entry: [
        ...record.entry.filter(
          (entry) => entry.resource.id !== previousTask.id
        ),
        ...correctionPaymentBundleEntries,
        ...otherDocumentReferences,
        correctionEncounter,
        { resource: correctionRequestWithLocationExtensions }
      ]
    },
    'CORRECTION_REQUESTED'
  )
}

export async function toUnassigned(
  record: ValidRecord,
  practitioner: Practitioner
) {
  const previousTask = getTaskFromSavedBundle(record)
  const unassignedTask = createUnassignedTask(previousTask, practitioner)

  const unassignedTaskWithPractitionerExtensions = setupLastRegUser(
    unassignedTask,
    practitioner
  )

  const unassignedTaskWithLocationExtensions = await setupLastRegLocation(
    unassignedTaskWithPractitionerExtensions,
    practitioner
  )

  const unassignedRecordWithTaskOnly: Bundle<SavedTask> = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [{ resource: unassignedTaskWithLocationExtensions }]
  }

  return unassignedRecordWithTaskOnly
}

export async function toVerified(
  record: RegisteredRecord | IssuedRecord,
  ipInfo: string
) {
  const previousTask = getTaskFromSavedBundle(record)
  const verifyRecordTask = createVerifyRecordTask(previousTask, ipInfo)

  return {
    ...record,
    entry: [
      ...record.entry.filter((e) => e.resource.resourceType !== 'Task'),
      {
        fullUrl: record.entry.find((e) => e.resource.resourceType === 'Task')!
          .fullUrl,
        resource: verifyRecordTask
      }
    ]
  }
}

export async function toCorrectionRejected(
  record: CorrectionRequestedRecord,
  practitioner: Practitioner,
  rejectionDetails: CorrectionRejectionInput
): Promise<
  RecordWithPreviousTask<RegisteredRecord | CertifiedRecord | IssuedRecord>
> {
  const currentCorrectionRequestedTask = getTaskFromSavedBundle(record)

  const correctionRejectionTask: Task = {
    ...currentCorrectionRequestedTask,
    status: 'rejected',
    reason: {
      text: rejectionDetails.reason
    },
    extension: extensionsWithoutAssignment(
      currentCorrectionRequestedTask.extension
    )
  }

  const correctionRejectionTaskWithPractitionerExtensions = setupLastRegUser(
    correctionRejectionTask,
    practitioner
  )

  const correctionRejectionWithLocationExtensions = await setupLastRegLocation(
    correctionRejectionTaskWithPractitionerExtensions,
    practitioner
  )

  const taskHistory = await getTaskHistory(currentCorrectionRequestedTask.id)

  const previousTaskBeforeCorrection = sortTasksDescending(
    taskHistory.entry.map((x) => x.resource)
  )

  const firstNonCorrectionTask = previousTaskBeforeCorrection.find((task) =>
    task.businessStatus?.coding?.some(
      (coding) => coding.code !== 'CORRECTION_REQUESTED'
    )
  )

  const previousStatus = firstNonCorrectionTask?.businessStatus?.coding?.[0]
    ?.code as 'REGISTERED' | 'CERTIFIED' | 'ISSUED'

  if (!firstNonCorrectionTask) {
    throw new Error(
      'Record did not have any tasks before correction. This should never happen'
    )
  }

  const previousTaskWithPractitionerExtensions = setupLastRegUser(
    firstNonCorrectionTask,
    practitioner
  )

  const previousTaskWithLocationExtensions = await setupLastRegLocation(
    previousTaskWithPractitionerExtensions,
    practitioner
  )

  // This is important as otherwise the when the older task is removed later on this one gets dropped out
  previousTaskWithPractitionerExtensions.lastModified = new Date().toISOString()

  const tasksToBeIncludedInBundle = [
    correctionRejectionWithLocationExtensions,
    previousTaskWithLocationExtensions
  ]

  return changeState(
    {
      ...record,
      entry: [
        ...record.entry.filter(
          (entry) => entry.resource.id !== currentCorrectionRequestedTask.id
        ),
        ...tasksToBeIncludedInBundle.map((resource) => ({ resource }))
      ]
    },
    previousStatus
  ) as any as RecordWithPreviousTask<
    RegisteredRecord | CertifiedRecord | IssuedRecord
  >
}

export async function toCertified(
  record: RegisteredRecord,
  token: string,
  eventType: EVENT_TYPE,
  certificateDetails: CertifyInput
): Promise<CertifiedRecord> {
  const practitioner = await getLoggedInPractitionerResource(token)
  const previousTask = getTaskFromSavedBundle(record)

  const taskWithoutPractitionerExtensions = createCertifiedTask(
    previousTask,
    practitioner
  )

  const [certifiedTask, practitionerResourcesBundle] =
    await withPractitionerDetails(taskWithoutPractitionerExtensions, token)

  const temporaryDocumentReferenceId = getUUID()
  const temporaryRelatedPersonId = getUUID()

  const relatedPersonEntries = createRelatedPersonEntries(
    certificateDetails.collector,
    temporaryRelatedPersonId,
    record
  )

  const documentReferenceEntry = createDocumentReferenceEntryForCertificate(
    temporaryDocumentReferenceId,
    temporaryRelatedPersonId,
    eventType,
    certificateDetails.hasShowedVerifiedDocument,
    certificateDetails.data
  )

  const certificateSection: CompositionSection = {
    title: 'Certificates',
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/sections',
          code: 'certificates'
        }
      ],
      text: 'Certificates'
    },
    entry: [
      {
        reference: `urn:uuid:${temporaryDocumentReferenceId}`
      }
    ]
  }

  const previousComposition = getComposition(record)

  const compositionWithCertificateSection: Composition = {
    ...previousComposition,
    section: [
      ...previousComposition.section.filter(
        ({ title }) => title !== 'Certificates'
      ),
      certificateSection
    ]
  }
  const changedResources: Bundle<
    Composition | Task | DocumentReference | RelatedPerson | Patient
  > = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [
      { resource: compositionWithCertificateSection },
      { resource: certifiedTask },
      ...relatedPersonEntries,
      documentReferenceEntry
    ]
  }
  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      changedResources,
      practitionerResourcesBundle
    ),
    'CERTIFIED'
  )
}

export async function toIssued(
  record: RegisteredRecord | CertifiedRecord,
  token: string,
  eventType: EVENT_TYPE,
  certificateDetails: IssueInput
): Promise<IssuedRecord> {
  const practitioner = await getLoggedInPractitionerResource(token)
  const previousTask = getTaskFromSavedBundle(record)

  const taskWithoutPractitionerExtensions = createIssuedTask(
    previousTask,
    practitioner
  )

  const [issuedTask, practitionerResourcesBundle] =
    await withPractitionerDetails(taskWithoutPractitionerExtensions, token)

  const temporaryDocumentReferenceId = getUUID()
  const temporaryRelatedPersonId = getUUID()

  const relatedPersonEntries = createRelatedPersonEntries(
    certificateDetails.collector,
    temporaryRelatedPersonId,
    record
  )

  const [paymentEntry] = createPaymentResources(certificateDetails.payment)

  const documentReferenceEntry = createDocumentReferenceEntryForCertificate(
    temporaryDocumentReferenceId,
    temporaryRelatedPersonId,
    eventType,
    certificateDetails.hasShowedVerifiedDocument,
    undefined,
    paymentEntry.fullUrl
  )

  const certificateSection: CompositionSection = {
    title: 'Certificates',
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/sections',
          code: 'certificates'
        }
      ],
      text: 'Certificates'
    },
    entry: [
      {
        reference: `urn:uuid:${temporaryDocumentReferenceId}`
      }
    ]
  }

  const previousComposition = getComposition(record)

  /*
   * In order to maintain backwards compatibility
   * we can't reuse the certificate section. Instead
   * each time "certify" event is fired, a new composition
   * section will be created with the new certificate. The older
   * certificates can be accessed from composition_history
   */
  const compositionWithCertificateSection: Composition = {
    ...previousComposition,
    section: [
      ...previousComposition.section.filter(
        ({ title }) => title !== 'Certificates'
      ),
      certificateSection
    ]
  }
  const changedResources: Bundle<
    | Composition
    | Task
    | DocumentReference
    | RelatedPerson
    | Patient
    | PaymentReconciliation
  > = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [
      { resource: compositionWithCertificateSection },
      { resource: issuedTask },
      ...relatedPersonEntries,
      paymentEntry,
      documentReferenceEntry
    ]
  }

  return changeState(
    await mergeChangedResourcesIntoRecord(
      record,
      changedResources,
      practitionerResourcesBundle
    ),
    'ISSUED'
  )
}

function extensionsWithoutAssignment(extensions: Extension[]) {
  return extensions.filter(
    (extension) => extension.url !== ASSIGNED_EXTENSION_URL
  )
}