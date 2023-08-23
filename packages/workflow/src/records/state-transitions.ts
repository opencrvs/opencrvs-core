import {
  CertifiedRecord,
  changeState,
  CorrectionRequestedRecord,
  Extension,
  IssuedRecord,
  Practitioner,
  RegisteredRecord,
  Task
} from '@opencrvs/commons'
import {
  setupLastRegLocation,
  setupLastRegUser
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'
import { ASSIGNED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'

import {
  CorrectionRejectionInput,
  CorrectionRequestInput
} from './correction-request'
import {
  createCorrectionRequestTask,
  getTaskHistory,
  sortTasksDescending
} from './fhir'

export async function toCorrectionRequested(
  record: RegisteredRecord | CertifiedRecord | IssuedRecord,
  practitioner: Practitioner,
  correctionDetails: CorrectionRequestInput
): Promise<CorrectionRequestedRecord> {
  const previousTask = getTaskResource(record)

  const correctionRequestTask = createCorrectionRequestTask(
    previousTask,
    correctionDetails
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
  const currentCorrectionRequestedTask = getTaskResource(record)

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
