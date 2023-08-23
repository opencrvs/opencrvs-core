import { Bundle } from './fhir'

// https://dnlytras.com/blog/nominal-types
declare const __nominal__type: unique symbol
export type Nominal<Type, Identifier> = Type & {
  readonly [__nominal__type]: Identifier
}

type RecordBase = Bundle
export type WaitingForValidationRecord = Nominal<
  RecordBase,
  'WaitingForValidation'
>
export type ValidatedRecord = Nominal<RecordBase, 'Validated'>
export type RegisteredRecord = Nominal<RecordBase, 'Registered'>
export type CorrectionRequestedRecord = Nominal<
  RecordBase,
  'CorrectionRequested'
>
export type CertifiedRecord = Nominal<RecordBase, 'Certified'>
export type IssuedRecord = Nominal<RecordBase, 'Issued'>

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
