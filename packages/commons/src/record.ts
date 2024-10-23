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
import { Nominal } from './nominal'

export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH',
  MARRIAGE = 'MARRIAGE'
}

export type ReadyForReviewRecord = Nominal<{}, 'ReadyForReview'>

export type WaitingForValidationRecord = Nominal<{}, 'WaitingForValidation'>

export type ValidatedRecord = Nominal<{}, 'Validated'>
export type RegisteredRecord = Nominal<{}, 'Registered'>
export type CorrectionRequestedRecord = Nominal<{}, 'CorrectionRequested'>
export type CertifiedRecord = Nominal<{}, 'Certified'>
export type IssuedRecord = Nominal<{}, 'Issued'>
export type InProgressRecord = Nominal<{}, 'InProgress'>
export type RejectedRecord = Nominal<{}, 'Rejected'>
export type ArchivedRecord = Nominal<{}, 'Archived'>

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

export type BirthRegistration = Nominal<{}, 'BirthRegistration'>
export type DeathRegistration = Nominal<{}, 'DeathRegistration'>
export type MarriageRegistration = Nominal<{}, 'MarriageRegistration'>
