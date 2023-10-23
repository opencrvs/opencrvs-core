import { Request, ServerRoute } from '@hapi/hapi'
import {
  CertifiedRecord,
  CorrectionRequestedRecord,
  RegisteredRecord,
  ValidatedRecord,
  WaitingForValidationRecord,
  Nominal,
  StateIdenfitiers,
  IssuedRecord
} from '@opencrvs/commons/types'
import { getRecordById } from './records'

export type Certify = Nominal<{}, 'Certify'>
export type Validate = Nominal<{}, 'Validate'>
export type Issue = Nominal<{}, 'Issue'>
export type RequestCorrection = Nominal<{}, 'RequestCorrection'>
export type RejectCorrection = Nominal<{}, 'RejectCorrection'>
export type ApproveCorrection = Nominal<{}, 'ApproveCorrection'>
export type MakeCorrection = Nominal<{}, 'MakeCorrection'>

export type ActionIdentifiers = {
  REQUEST_CORRECTION: RequestCorrection
  APPROVE_CORRECTION: ApproveCorrection
  MAKE_CORRECTION: MakeCorrection
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
  | Transition<CertifiedRecord, Issue, IssuedRecord>
  // Corrections
  // Request correction
  | Transition<RegisteredRecord, RequestCorrection, CorrectionRequestedRecord>
  // Make correction
  | Transition<RegisteredRecord, MakeCorrection, RegisteredRecord>
  // Approve correction
  | Transition<CorrectionRequestedRecord, ApproveCorrection, RegisteredRecord>
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
    request: Request,
    record: StateIdenfitiers[T[number]]
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
    handler: async (request: Request) => {
      const record = await getRecordById(
        request.params.recordId,
        request.headers.authorization,
        params.allowedStartStates
      )
      return params.handler(request, record)
    }
  }
}

type Transition<StartState, Action, EndState> = {
  start: StartState
  action: Action
  end: EndState
}
