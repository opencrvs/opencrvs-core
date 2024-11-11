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
import { Scope } from '@opencrvs/commons/authentication'
import {
  CertifiedRecord,
  CorrectionRequestedRecord,
  RegisteredRecord,
  ValidatedRecord,
  Nominal,
  StateIdenfitiers,
  IssuedRecord,
  InProgressRecord,
  ReadyForReviewRecord,
  WaitingForValidationRecord,
  RejectedRecord,
  ArchivedRecord
} from '@opencrvs/commons/types'
import { getRecordById } from './records'

type Certify = Nominal<{}, 'Certify'>
type Validate = Nominal<{}, 'Validate'>
type Update = Nominal<{}, 'Update'>
type Register = Nominal<{}, 'Register'>
type Issue = Nominal<{}, 'Issue'>
type RequestCorrection = Nominal<{}, 'RequestCorrection'>
type RejectCorrection = Nominal<{}, 'RejectCorrection'>
type ApproveCorrection = Nominal<{}, 'ApproveCorrection'>
type MakeCorrection = Nominal<{}, 'MakeCorrection'>
type WaitForExternalValidation = Nominal<{}, 'WaitForExternalValidation'>
type Archive = Nominal<{}, 'Archive'>
type Reject = Nominal<{}, 'Reject'>
type Reinstate = Nominal<{}, 'Reinstate'>

type ActionIdentifiers = {
  REQUEST_CORRECTION: RequestCorrection
  APPROVE_CORRECTION: ApproveCorrection
  MAKE_CORRECTION: MakeCorrection
  REJECT_CORRECTION: RejectCorrection
  CERTIFY: Certify
  ISSUE: Issue
  VALIDATE: Validate
  UPDATE_DECLARATION: Update
  REGISTER: Register
  REJECT: Reject
  WAITING_VALIDATION: WaitForExternalValidation
  ARCHIVE: Archive
  REINSTATE: Reinstate
}

/*
 * Amend this state tree to allow more state transitions
 */

type StateTree =
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
  // Register declaration
  | Transition<
      ReadyForReviewRecord | ValidatedRecord,
      Register,
      RegisteredRecord
    >
  // Waiting for validation declaration
  | Transition<
      ReadyForReviewRecord | ValidatedRecord,
      WaitForExternalValidation,
      WaitingForValidationRecord | RejectedRecord
    >
  // Archive declaration
  | Transition<ReadyForReviewRecord | ValidatedRecord, Archive, ArchivedRecord>
  // Reinstate declaration
  | Transition<
      ArchivedRecord,
      Reinstate,
      ReadyForReviewRecord | ValidatedRecord
    >
  // Reject declaration
  | Transition<
      ReadyForReviewRecord | InProgressRecord | ValidatedRecord,
      Reject,
      RejectedRecord
    >

/*
 * Internals
 */

type GetEndState<StartState, Action> = Extract<
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
  allowedScopes: Scope[]
  includeHistoryResources: boolean
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
    ...(params.allowedScopes && {
      options: {
        auth: {
          scope: params.allowedScopes
        },
        tags: ['api']
      }
    }),
    handler: async (request: Request) => {
      const record = await getRecordById(
        request.params.recordId,
        request.headers.authorization,
        params.allowedStartStates,
        params.includeHistoryResources
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
