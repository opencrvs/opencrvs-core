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
import { PractitionerRole } from 'fhir/r3'
import {
  Bundle,
  Composition,
  CorrectionRequestedTask,
  DocumentReference,
  Encounter,
  Location,
  Observation,
  Patient,
  PaymentReconciliation,
  Practitioner,
  QuestionnaireResponse,
  RelatedPerson,
  Resource,
  SavedBundle,
  Task,
  TrackingID,
  getComposition,
  getStatusFromTask,
  getTaskFromSavedBundle,
  isCorrectionRequestedTask,
  isTask
} from './fhir'
import { NestedNominal, Nominal } from './nominal'

export function getEventLabelFromBundle(bundle: Bundle) {
  const composition = getComposition(bundle)
  if (
    composition.type.coding?.[0].code === 'birth-declaration' ||
    composition.type.coding?.[0].code === 'birth-notification'
  ) {
    return 'BirthRegistration'
  } else if (
    composition.type.coding?.[0].code === 'death-declaration' ||
    composition.type.coding?.[0].code === 'death-notification'
  ) {
    return 'DeathRegistration'
  } else {
    return 'MarriageRegistration'
  }
}

export type ReadyForReviewRecord = Nominal<SavedBundle, 'ReadyForReview'>

export type WaitingForValidationRecord = Nominal<
  SavedBundle<
    | Composition
    | DocumentReference
    | Encounter
    | Patient
    | RelatedPerson
    | PaymentReconciliation
    | Task
    | Practitioner
    | PractitionerRole
    | Location
    | Observation
  >,
  'WaitingForValidation'
>

export type ValidatedRecord = Nominal<SavedBundle, 'Validated'>
export type RegisteredRecord = Nominal<
  SavedBundle<
    | Composition
    | DocumentReference
    | Encounter
    | Patient
    | RelatedPerson
    | PaymentReconciliation
    | Task
    | Practitioner
    | PractitionerRole
    | Location
    | Observation
    | QuestionnaireResponse
  >,
  'Registered'
>
export type CorrectionRequestedRecord = Nominal<
  SavedBundle,
  'CorrectionRequested'
>
export type CertifiedRecord = Nominal<SavedBundle, 'Certified'>
export type IssuedRecord = Nominal<SavedBundle, 'Issued'>
export type InProgressRecord = Nominal<SavedBundle, 'InProgress'>
export type RejectedRecord = Nominal<SavedBundle, 'Rejected'>
export type ArchivedRecord = Nominal<SavedBundle, 'Archived'>

export type ValidRecord =
  | InProgressRecord
  | ReadyForReviewRecord
  | ValidatedRecord
  | RegisteredRecord
  | CorrectionRequestedRecord
  | CertifiedRecord
  | IssuedRecord
  | RejectedRecord
  | WaitingForValidationRecord
  | ArchivedRecord

export type RegistrationStatus =
  | 'ARCHIVED'
  | 'CERTIFIED'
  | 'CORRECTION_REQUESTED'
  | 'DECLARATION_UPDATED'
  | 'DECLARED'
  | 'IN_PROGRESS'
  | 'ISSUED'
  | 'REGISTERED'
  | 'REJECTED'
  | 'VALIDATED'
  | 'WAITING_VALIDATION'

export type StateIdenfitiers = {
  IN_PROGRESS: InProgressRecord
  READY_FOR_REVIEW: ReadyForReviewRecord
  VALIDATED: ValidatedRecord
  REGISTERED: RegisteredRecord
  CORRECTION_REQUESTED: CorrectionRequestedRecord
  CERTIFIED: CertifiedRecord
  ISSUED: IssuedRecord
  WAITING_VALIDATION: WaitingForValidationRecord
  REJECTED: RejectedRecord
  ARCHIVED: ArchivedRecord
}

export function changeState<R extends Bundle, A extends keyof StateIdenfitiers>(
  record: R,
  nextState: A | A[]
) {
  return record as any as StateIdenfitiers[A]
}

export function isInProgress(record: ValidRecord): record is InProgressRecord {
  return getStatusFromTask(getTaskFromSavedBundle(record)) === 'IN_PROGRESS'
}

export function isReadyForReview(
  record: ValidRecord
): record is ReadyForReviewRecord {
  return getStatusFromTask(getTaskFromSavedBundle(record)) === 'DECLARED'
}

export function isValidated(record: ValidRecord): record is ValidatedRecord {
  return getStatusFromTask(getTaskFromSavedBundle(record)) === 'VALIDATED'
}

export function isWaitingExternalValidation(
  record: ValidRecord
): record is WaitingForValidationRecord {
  return (
    getStatusFromTask(getTaskFromSavedBundle(record)) === 'WAITING_VALIDATION'
  )
}

export function isRejected(record: ValidRecord): record is RejectedRecord {
  return getStatusFromTask(getTaskFromSavedBundle(record)) === 'REJECTED'
}

export function getCorrectionRequestedTask(
  record: CorrectionRequestedRecord
): CorrectionRequestedTask {
  const task = record.entry
    .map((entry) => entry.resource)
    .filter(isTask)
    .find(isCorrectionRequestedTask)

  if (!task) {
    throw new Error('No correction requested task found')
  }
  return task as CorrectionRequestedTask
}

export type RecordWithoutTasks<T extends ValidRecord> = NestedNominal<
  T,
  'RecordWithoutTasks'
>
export type RecordWithPreviousTask<T extends ValidRecord> = NestedNominal<
  T,
  'RecordWithPreviousTask'
>

export function addResourceToRecord<T extends Bundle>(
  bundle: T,
  resource: Resource
): T {
  return {
    ...bundle,
    entry: [...bundle.entry, { resource }]
  }
}

export function getTrackingId(record: ValidRecord) {
  const task = getTaskFromSavedBundle(record)

  const identifier = task.identifier.find((identifier) =>
    identifier.system.endsWith('tracking-id')
  )

  if (!identifier) {
    throw new Error('No tracking id found from task')
  }

  return identifier.value as TrackingID
}

export function replaceFromBundle(
  bundle: Bundle,
  resource: Resource,
  newResource: Resource
) {
  return {
    ...bundle,
    entry: bundle.entry.map((entry) => {
      const shouldUpdate =
        entry.resource === resource ||
        (entry.resource.id && resource.id && entry.resource.id === resource.id)
      return shouldUpdate ? { ...entry, resource: newResource } : entry
    })
  }
}

export function getRegistrationNumber(record: RegisteredRecord): string {
  const taskEntryResource = getTaskFromSavedBundle(record)
  const identiferWithRn = taskEntryResource.identifier.find((obj) =>
    obj.system.endsWith('registration-number')
  )
  if (!identiferWithRn)
    throw new Error('Could not find registration number in bundle')
  return identiferWithRn.value
}
