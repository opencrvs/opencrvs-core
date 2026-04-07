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

import { SUBMISSION_STATUS } from '.'

const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED',
  WAITING_VALIDATION: 'WAITING_VALIDATION',
  CORRECTION_REQUESTED: 'CORRECTION_REQUESTED'
}

export const isPendingCorrection = (status: SUBMISSION_STATUS | undefined) =>
  status === EVENT_STATUS.CORRECTION_REQUESTED

export const isReviewableDeclaration = (
  status: SUBMISSION_STATUS | undefined
) => status && [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED].includes(status)

export const isUpdatableDeclaration = (status: SUBMISSION_STATUS | undefined) =>
  status &&
  [
    SUBMISSION_STATUS.DRAFT,
    EVENT_STATUS.IN_PROGRESS,
    EVENT_STATUS.REJECTED
  ].includes(status)

export const isPrintable = (status: SUBMISSION_STATUS | undefined) =>
  status &&
  [SUBMISSION_STATUS.REGISTERED, SUBMISSION_STATUS.ISSUED].includes(status)

export const isIssuable = (status: SUBMISSION_STATUS | undefined) =>
  status === SUBMISSION_STATUS.CERTIFIED

const isRecordOrDeclaration = (status: SUBMISSION_STATUS | undefined) =>
  status
    ? [
        SUBMISSION_STATUS.REGISTERED,
        SUBMISSION_STATUS.CORRECTION_REQUESTED,
        SUBMISSION_STATUS.CERTIFIED
      ].includes(status)
      ? 'record'
      : 'declaration'
    : ''

export const canBeCorrected = (status: SUBMISSION_STATUS | undefined) =>
  status &&
  [
    SUBMISSION_STATUS.REGISTERED,
    SUBMISSION_STATUS.CERTIFIED,
    SUBMISSION_STATUS.ISSUED
  ].includes(status)

export const isArchivable = (status: SUBMISSION_STATUS | undefined) =>
  status &&
  [
    SUBMISSION_STATUS.IN_PROGRESS,
    SUBMISSION_STATUS.DECLARED,
    SUBMISSION_STATUS.VALIDATED,
    SUBMISSION_STATUS.REJECTED
  ].includes(status)

export const canBeReinstated = (status: SUBMISSION_STATUS | undefined) =>
  status === SUBMISSION_STATUS.ARCHIVED

const isViewable = (status: SUBMISSION_STATUS | undefined) =>
  status !== SUBMISSION_STATUS.DRAFT
