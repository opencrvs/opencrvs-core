import {
  BundleEntry,
  CertifiedRecord,
  changeState,
  CorrectionRequestedRecord,
  Extension,
  findExtension,
  getCorrectionRequestedTask,
  getTaskFromBundle,
  IssuedRecord,
  isUnsavedPaymentReconciliationBundleEntry,
  PaymentReconciliation,
  Practitioner,
  RegisteredRecord,
  Task,
  Unsaved,
  sortTasksDescending,
  RecordWithPreviousTask
} from '@opencrvs/commons'
import {
  setupLastRegLocation,
  setupLastRegUser
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { ASSIGNED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'

import {
  ApproveRequestInput,
  CorrectionRejectionInput,
  CorrectionRequestInput,
  MakeCorrectionRequestInput
} from './correction-request'
import {
  createCorrectedTask,
  createCorrectionEncounter,
  createCorrectionPaymentResources,
  createCorrectionProofOfLegalCorrectionDocument,
  createCorrectionRequestTask,
  getTaskHistory
} from './fhir'

export async function toCorrected(
  record: RegisteredRecord | CertifiedRecord | IssuedRecord,
  practitioner: Practitioner,
  correctionDetails: MakeCorrectionRequestInput,
  proofOfLegalCorrectionAttachments: Array<{ type: string; url: string }>,
  paymentAttachmentURL?: string
): Promise<RegisteredRecord> {
  const previousTask = getTaskFromBundle(record)

  let correctionPaymentBundleEntries: Unsaved<BundleEntry>[] = []

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
    isUnsavedPaymentReconciliationBundleEntry
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

  return changeState(
    {
      ...record,
      entry: record.entry
        .filter((entry) => entry.resource.id !== previousTask.id)
        .concat(correctionPaymentBundleEntries)
        .concat(otherDocumentReferences)
        .concat(correctionEncounter)
        .concat({ resource: correctionRequestWithLocationExtensions })
    },
    'REGISTERED'
  )
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
    (resource): resource is BundleEntry<fhir3.Encounter> =>
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

  const paymentReconciliation: BundleEntry<PaymentReconciliation> | undefined =
    correctionPaymentId
      ? record.entry.find(
          (resource): resource is BundleEntry<PaymentReconciliation> =>
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
      entry: record.entry
        .filter((entry) => entry.resource.id !== correctionAcceptedTask.id)
        .concat({ resource: correctionAcceptedTask })
        .concat({ resource: correctionRequestWithLocationExtensions })
    },
    'REGISTERED'
  ) as any as RecordWithPreviousTask<RegisteredRecord>
}

export async function toCorrectionRequested(
  record: RegisteredRecord | CertifiedRecord | IssuedRecord,
  practitioner: Practitioner,
  correctionDetails: CorrectionRequestInput,
  proofOfLegalCorrectionAttachments: Array<{ type: string; url: string }>,
  paymentAttachmentURL?: string
): Promise<CorrectionRequestedRecord> {
  const previousTask = getTaskFromBundle(record)

  let correctionPaymentBundleEntries: Unsaved<BundleEntry>[] = []

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
    isUnsavedPaymentReconciliationBundleEntry
  )

  const correctionRequestTask = createCorrectionRequestTask(
    previousTask,
    correctionDetails,
    correctionEncounter,
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
      entry: record.entry
        .filter((entry) => entry.resource.id !== previousTask.id)
        .concat(correctionPaymentBundleEntries)
        .concat(otherDocumentReferences)
        .concat(correctionEncounter)
        .concat({ resource: correctionRequestWithLocationExtensions })
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
  const currentCorrectionRequestedTask = getTaskFromBundle(record)

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

  const tasksToBeIncludedInBundle = [
    correctionRejectionWithLocationExtensions,
    previousTaskWithLocationExtensions
  ]

  return changeState(
    {
      ...record,
      entry: record.entry
        .filter(
          (entry) => entry.resource.id !== currentCorrectionRequestedTask.id
        )
        .concat(tasksToBeIncludedInBundle.map((resource) => ({ resource })))
    },
    previousStatus
  ) as any as RecordWithPreviousTask<
    RegisteredRecord | CertifiedRecord | IssuedRecord
  >
}

function extensionsWithoutAssignment(extensions: Extension[]) {
  return extensions.filter(
    (extension) => extension.url !== ASSIGNED_EXTENSION_URL
  )
}
