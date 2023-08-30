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
  RelatedPerson,
  Task,
  getBusinessStatus,
  isCorrectionRequestedTask,
  isTask,
  sortTasksDescending
} from './fhir'

// https://dnlytras.com/blog/nominal-types
declare const __nominal__type: unique symbol
declare const __nominal__type__2: unique symbol
export type Nominal<Type, Identifier extends string> = Type & {
  readonly [__nominal__type]: Identifier
}

type RecordBase = Bundle
export type WaitingForValidationRecord = Nominal<
  RecordBase,
  'WaitingForValidation'
>
export type ValidatedRecord = Nominal<RecordBase, 'Validated'>
export type RegisteredRecord = Nominal<
  Bundle<
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
  'Registered'
>
export type CorrectionRequestedRecord = Nominal<
  RecordBase,
  'CorrectionRequested'
>
export type CertifiedRecord = Nominal<RecordBase, 'Certified'>
export type IssuedRecord = Nominal<RecordBase, 'Issued'>

export type ValidRecord =
  | WaitingForValidationRecord
  | ValidatedRecord
  | RegisteredRecord
  | CorrectionRequestedRecord
  | CertifiedRecord
  | IssuedRecord

export type StateIdenfitiers = {
  VALIDATED: ValidatedRecord
  REGISTERED: RegisteredRecord
  CORRECTION_REQUESTED: CorrectionRequestedRecord
  CERTIFIED: CertifiedRecord
  ISSUED: IssuedRecord
}

export function changeState<
  R extends RecordBase,
  A extends keyof StateIdenfitiers
>(record: R, nextState: A) {
  return record as any as StateIdenfitiers[A]
}

export function getState(record: RecordBase) {
  const task = record.entry.map(({ resource }) => resource).find(isTask)
  if (!task) {
    throw new Error('No task found')
  }
  return getBusinessStatus(task) as keyof StateIdenfitiers
}

export function getCorrectionRequestedTask(record: CorrectionRequestedRecord) {
  const task: CorrectionRequestedTask | undefined = record.entry
    .map((entry) => entry.resource)
    .filter(isTask)
    .find(isCorrectionRequestedTask)

  if (!task) {
    throw new Error('No correction requested task found')
  }
  return task
}

export type RecordWithPreviousTask<T extends ValidRecord> = Omit<
  T,
  typeof __nominal__type
> & {
  readonly [__nominal__type]: 'RecordWithPreviousTask'
  readonly [__nominal__type__2]: T[typeof __nominal__type]
}

export function withOnlyLatestTask<
  T extends RecordWithPreviousTask<ValidRecord>
>(record: T): T extends RecordWithPreviousTask<infer X> ? X : never {
  const tasks = sortTasksDescending(
    record.entry.map((entry) => entry.resource).filter(isTask)
  )

  const newRec = changeState(
    {
      ...record,
      entry: record.entry.filter(
        (entry) => !isTask(entry.resource) || entry.resource === tasks[0] // match by reference
      )
    },
    getState(record)
  )

  return newRec as any
}
