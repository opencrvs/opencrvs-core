import {
  BundleEntry,
  CertifiedRecord,
  changeState,
  CorrectionRequestedRecord,
  Extension,
  getTaskFromBundle,
  IssuedRecord,
  isUnsavedPaymentReconciliationBundleEntry,
  Practitioner,
  RegisteredRecord,
  Task,
  Unsaved
} from '@opencrvs/commons'
import {
  setupLastRegLocation,
  setupLastRegUser
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'

import { ASSIGNED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'

import {
  CorrectionRejectionInput,
  CorrectionRequestInput
} from './correction-request'
import {
  createCorrectionEncounter,
  createCorrectionPaymentResources,
  createCorrectionProofOfLegalCorrectionDocument,
  createCorrectionRequestTask,
  getTaskHistory,
  sortTasksDescending
} from './fhir'

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
): Promise<RegisteredRecord | CertifiedRecord | IssuedRecord> {
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
  )
}

function extensionsWithoutAssignment(extensions: Extension[]) {
  return extensions.filter(
    (extension) => extension.url !== ASSIGNED_EXTENSION_URL
  )
}
