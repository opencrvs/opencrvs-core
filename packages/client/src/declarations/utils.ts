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

import { EVENT_STATUS } from '@client/workqueue'
import { SUBMISSION_STATUS } from '.'

export const isPendingCorrection = (status?: string) =>
  status === EVENT_STATUS.CORRECTION_REQUESTED

export const isReviewableDeclaration = (status?: string) =>
  status && [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED].includes(status)

export const isUpdatableDeclaration = (status?: string) =>
  status &&
  [
    SUBMISSION_STATUS.DRAFT,
    EVENT_STATUS.IN_PROGRESS,
    EVENT_STATUS.REJECTED
  ].includes(status)

export const isPrintable = (status?: string) =>
  status &&
  [SUBMISSION_STATUS.REGISTERED, SUBMISSION_STATUS.ISSUED].includes(
    status as SUBMISSION_STATUS
  )

export const isCertified = (status?: string) =>
  status === SUBMISSION_STATUS.CERTIFIED

export const isRecordOrDeclaration = (status?: string) =>
  [
    SUBMISSION_STATUS.REGISTERED,
    SUBMISSION_STATUS.CORRECTION_REQUESTED,
    SUBMISSION_STATUS.CERTIFIED
  ].includes(status as any as SUBMISSION_STATUS)
    ? 'record'
    : 'declaration'

export const canBeCorrected = (status?: string) =>
  status &&
  [
    SUBMISSION_STATUS.REGISTERED,
    SUBMISSION_STATUS.CERTIFIED,
    SUBMISSION_STATUS.ISSUED
  ].includes(status as SUBMISSION_STATUS)

export const isArchivable = (status?: string) =>
  status &&
  [
    SUBMISSION_STATUS.IN_PROGRESS,
    SUBMISSION_STATUS.DECLARED,
    SUBMISSION_STATUS.VALIDATED,
    SUBMISSION_STATUS.REJECTED
  ].includes(status as SUBMISSION_STATUS)

export const isArchived = (status?: string) =>
  status === SUBMISSION_STATUS.ARCHIVED
