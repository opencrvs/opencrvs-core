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
import { Request, ServerRoute } from '@hapi/hapi'
import {
  CertifiedRecord,
  CorrectionRequestedRecord,
  RegisteredRecord,
  ValidatedRecord,
  Nominal,
  StateIdenfitiers,
  IssuedRecord,
  InProgressRecord,
  ReadyForReviewRecord
} from '@opencrvs/commons/types'
import { getRecordById } from './records'

export type Certify = Nominal<{}, 'Certify'>
export type Validate = Nominal<{}, 'Validate'>
export type Update = Nominal<{}, 'Update'>
export type Issue = Nominal<{}, 'Issue'>
export type RequestCorrection = Nominal<{}, 'RequestCorrection'>
export type RejectCorrection = Nominal<{}, 'RejectCorrection'>
export type ApproveCorrection = Nominal<{}, 'ApproveCorrection'>
export type MakeCorrection = Nominal<{}, 'MakeCorrection'>
export type Archive = Nominal<{}, 'Archive'>

export type ActionIdentifiers = {
  REQUEST_CORRECTION: RequestCorrection
  APPROVE_CORRECTION: ApproveCorrection
  MAKE_CORRECTION: MakeCorrection
  REJECT_CORRECTION: RejectCorrection
  CERTIFY: Certify
  VALIDATION: Validate
  DECLARATION_UPDATED: Update
}

/*
 * Amend this state tree to allow more state transitions
 */

export type StateTree =
  | Transition<ReadyForReviewRecord, Validate, ValidatedRecord>
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
  // Update declaration
  | Transition<
      InProgressRecord | ReadyForReviewRecord,
      Update,
      InProgressRecord | ReadyForReviewRecord
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
