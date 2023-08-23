import { Lifecycle, ServerRoute } from '@hapi/hapi'
import {
  CertifiedRecord,
  CorrectionRequestedRecord,
  RegisteredRecord,
  ValidatedRecord,
  WaitingForValidationRecord,
  Nominal,
  StateIdenfitiers,
  IssuedRecord
} from '@opencrvs/commons'

export type RequestCorrection = Nominal<{}, 'RequestCorrection'>
export type Certify = Nominal<{}, 'Certify'>
export type Validate = Nominal<{}, 'Validate'>
export type Issue = Nominal<{}, 'Issue'>
export type RejectCorrection = Nominal<{}, 'RejectCorrection'>

export type ActionIdentifiers = {
  REQUEST_CORRECTION: RequestCorrection
  REJECT_CORRECTION: RejectCorrection
  CERTIFY: Certify
  VALIDATION: Validate
}

export type Action = RequestCorrection | Certify | Validate

/*
 * Amend this state tree to allow more state transitions
 */

export type StateTree =
  | Transition<WaitingForValidationRecord, Validate, ValidatedRecord>
  | Transition<RegisteredRecord, Certify, CertifiedRecord>
  | Transition<RegisteredRecord, RequestCorrection, CorrectionRequestedRecord>
  | Transition<CertifiedRecord, Issue, IssuedRecord>
  // Reject correction
  | Transition<
      CorrectionRequestedRecord,
      RejectCorrection,
      RegisteredRecord | CertifiedRecord | IssuedRecord
    >

/*
 * Internals
 */

export type GetEndState<StartState, Action> = Extract<
  StateTree,
  { start: StartState; action: Action }
>['end']

type PromiseOrValue<T> = T | Promise<T>

type RecordStateChangeRouteHandler<
  T extends Array<keyof StateIdenfitiers>,
  A extends keyof ActionIdentifiers
> = {
  allowedStartStates: T
  action: A
  method: string
  path: string
  handler: (
    ...params: Parameters<Lifecycle.Method>
  ) => PromiseOrValue<
    GetEndState<
      StateIdenfitiers[T[number]],
      A extends keyof ActionIdentifiers ? ActionIdentifiers[A] : never
    >
  >
}

export function createRoute<
  T extends Array<keyof StateIdenfitiers>,
  A extends keyof ActionIdentifiers
>(params: RecordStateChangeRouteHandler<T, A>): ServerRoute {
  return {
    path: params.path,
    method: params.method,
    handler: params.handler
  }
}

type Transition<StartState, Action, EndState> = {
  start: StartState
  action: Action
  end: EndState
}
