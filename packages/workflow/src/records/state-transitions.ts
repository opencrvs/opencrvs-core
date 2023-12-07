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
  SavedTask,
  Bundle,
  CompositionSection,
  DocumentReference,
  getComposition,
  Composition,
  EVENT_TYPE,
  RelatedPerson
} from '@opencrvs/commons/types'
import { getUUID } from '@opencrvs/commons'
import {
  setupLastRegLocation,
  setupLastRegUser
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { ASSIGNED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import {
  ApproveRequestInput,
  CorrectionRejectionInput,
  CorrectionRequestInput,
  MakeCorrectionRequestInput,
  ChangedValuesInput
} from '@workflow/records/correction-request'
import {
  createCorrectedTask,
  createCorrectionEncounter,
  createCorrectionPaymentResources,
  createCorrectionProofOfLegalCorrectionDocument,
  createCorrectionRequestTask,
  createUpdatedTask,
  createValidateTask,
  getTaskHistory
} from '@workflow/records/fhir'
import { CertificateInput } from './validations/certify'

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
    correctionPaymentBundleEntries = createCorrectionPaymentResources(
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
  practitioner: Practitioner,
  updatedDetails: ChangedValuesInput
): Promise<InProgressRecord | ReadyForReviewRecord> {
  const previousTask = getTaskFromSavedBundle(record)

  const updatedTask = createUpdatedTask(
    previousTask,
    updatedDetails,
    practitioner
  )
  const updatedTaskWithPractitionerExtensions = setupLastRegUser(
    updatedTask,
    practitioner
  )

  const updatedTaskWithLocationExtensions = await setupLastRegLocation(
    updatedTaskWithPractitionerExtensions,
    practitioner
  )

  const newEntries = [
    ...record.entry.map((entry) => {
      if (entry.resource.id !== previousTask.id) {
        return entry
      }
      return {
        ...entry,
        resource: updatedTaskWithLocationExtensions
      }
    })
  ]

  const updatedRecord = {
    ...record,
    entry: newEntries
  }
  return updatedRecord
}

export async function toValidated(
  record: InProgressRecord | ReadyForReviewRecord,
  practitioner: Practitioner
): Promise<ValidatedRecord> {
  const previousTask = getTaskFromSavedBundle(record)
  const validatedTask = createValidateTask(previousTask, practitioner)

  const validatedTaskWithPractitionerExtensions = setupLastRegUser(
    validatedTask,
    practitioner
  )

  const validatedTaskWithLocationExtensions = await setupLastRegLocation(
    validatedTaskWithPractitionerExtensions,
    practitioner
  )

  return changeState(
    {
      ...record,
      entry: [
        ...record.entry.filter(
          (entry) => entry.resource.id !== previousTask.id
        ),
        { resource: validatedTaskWithLocationExtensions }
      ]
    },
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
    correctionPaymentBundleEntries = createCorrectionPaymentResources(
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

async function createCertifiedTask(
  previousTask: SavedTask,
  practitioner: Practitioner
): Promise<SavedTask> {
  const certifiedTask: SavedTask = {
    ...previousTask,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      )
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'CERTIFIED'
        }
      ]
    }
  }
  const certifiedTaskWithPractitionerExtensions = setupLastRegUser(
    certifiedTask,
    practitioner
  )

  return await setupLastRegLocation(
    certifiedTaskWithPractitionerExtensions,
    practitioner
  )
}

export async function toCertified(
  record: RegisteredRecord,
  practitioner: Practitioner,
  eventType: EVENT_TYPE,
  certificateDetails: Omit<CertificateInput, 'data'> & { dataUrl: string }
): Promise<Bundle<Composition | Task | DocumentReference | RelatedPerson>> {
  const previousTask = getTaskFromSavedBundle(record)

  const certifiedTask = await createCertifiedTask(previousTask, practitioner)

  const temporaryDocumentReferenceId = getUUID()
  const temporaryRelatedPersonId = getUUID()

  const relatedPersonEntry: BundleEntry<RelatedPerson> = {
    fullUrl: `urn:uuid:${temporaryRelatedPersonId}`,
    resource: {
      resourceType: 'RelatedPerson',
      relationship: {
        coding: [
          {
            system:
              'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
            code: certificateDetails.collector.relationship
          }
        ]
      }
    }
  }

  const certificateSection: CompositionSection = {
    // TODO: Add stricter type for title
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

  const documentReferenceEntry: BundleEntry<DocumentReference> = {
    fullUrl: `urn:uuid:${temporaryDocumentReferenceId}`,
    resource: {
      resourceType: 'DocumentReference',
      masterIdentifier: {
        system: 'urn:ietf:rfc:3986',
        value: temporaryDocumentReferenceId
      },
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/collector',
          valueReference: {
            reference: `urn:uuid:${temporaryRelatedPersonId}`
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
          valueBoolean: certificateDetails.hasShowedVerifiedDocument
        }
      ],
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/certificate-type',
            code: eventType
          }
        ]
      },
      content: [
        {
          attachment: {
            contentType: 'application/pdf',
            data: certificateDetails.dataUrl
          }
        }
      ],
      status: 'current'
    }
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
  return {
    type: 'document',
    resourceType: 'Bundle',
    entry: [
      { resource: compositionWithCertificateSection },
      { resource: certifiedTask },
      documentReferenceEntry,
      relatedPersonEntry
    ]
  }
}

function extensionsWithoutAssignment(extensions: Extension[]) {
  return extensions.filter(
    (extension) => extension.url !== ASSIGNED_EXTENSION_URL
  )
}
