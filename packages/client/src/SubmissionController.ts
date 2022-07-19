/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { AppStore } from '@client/store'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import {
  isReadyStatus,
  declarationReadyForStatusChange,
  READY_STATUSES,
  ArrayElement
} from './declarations/submissionMiddleware'

type IRetryStatus = ArrayElement<typeof ALLOWED_STATUS_FOR_RETRY>
type IInProgressStatus = ArrayElement<typeof INPROGRESS_STATUS>

const INTERVAL_TIME = 5000
const HANGING_EXPIRE_MINUTES = 15

const ALLOWED_STATUS_FOR_RETRY = [
  ...READY_STATUSES,
  SUBMISSION_STATUS.FAILED_NETWORK
] as const

const INPROGRESS_STATUS = [
  SUBMISSION_STATUS.SUBMITTING,
  SUBMISSION_STATUS.APPROVING,
  SUBMISSION_STATUS.REGISTERING,
  SUBMISSION_STATUS.REJECTING,
  SUBMISSION_STATUS.ARCHIVING,
  SUBMISSION_STATUS.CERTIFYING,
  SUBMISSION_STATUS.REQUESTING_CORRECTION
] as const

const changeStatus = {
  [SUBMISSION_STATUS.SUBMITTING]: SUBMISSION_STATUS.READY_TO_SUBMIT,
  [SUBMISSION_STATUS.APPROVING]: SUBMISSION_STATUS.READY_TO_APPROVE,
  [SUBMISSION_STATUS.REGISTERING]: SUBMISSION_STATUS.READY_TO_REGISTER,
  [SUBMISSION_STATUS.REJECTING]: SUBMISSION_STATUS.READY_TO_REJECT,
  [SUBMISSION_STATUS.ARCHIVING]: SUBMISSION_STATUS.READY_TO_ARCHIVE,
  [SUBMISSION_STATUS.CERTIFYING]: SUBMISSION_STATUS.READY_TO_CERTIFY,
  [SUBMISSION_STATUS.REQUESTING_CORRECTION]:
    SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
} as const

function isInProgressStatus(status: string): status is IInProgressStatus {
  return INPROGRESS_STATUS.includes(status as IInProgressStatus)
}

export class SubmissionController {
  private store: AppStore
  public syncRunning = false
  private syncCount = 0

  constructor(store: AppStore) {
    this.store = store
  }

  public start = () => {
    setInterval(() => {
      this.sync()
    }, INTERVAL_TIME)
  }

  private getDeclarations = () =>
    this.store.getState().declarationsState.declarations || []

  private getSubmitableDeclarations = () => {
    return this.getDeclarations().filter(
      (app: IDeclaration) =>
        app.submissionStatus &&
        ALLOWED_STATUS_FOR_RETRY.includes(app.submissionStatus as IRetryStatus)
    )
  }
  public requeueHangingDeclarations = () => {
    const now = Date.now()
    this.getDeclarations()
      .filter((app: IDeclaration) => {
        return (
          app.submissionStatus &&
          app.modifiedOn &&
          differenceInMinutes(now, app.modifiedOn) > HANGING_EXPIRE_MINUTES
        )
      })
      .forEach((app: IDeclaration) => {
        const submissionStatus = app.submissionStatus
        if (submissionStatus && isInProgressStatus(submissionStatus)) {
          this.store.dispatch(
            declarationReadyForStatusChange({
              ...app,
              submissionStatus: changeStatus[submissionStatus]
            })
          )
        }
      })
  }
  /* eslint-disable no-console */

  public sync = async () => {
    this.syncCount++
    console.debug(`[${this.syncCount}] Starting sync...`)
    if (!navigator.onLine || this.syncRunning) {
      console.debug(
        `[${this.syncCount}] Sync exiting early (offline or already syncing)`
      )
      return
    }

    this.syncRunning = true

    this.requeueHangingDeclarations()
    const declarations = this.getSubmitableDeclarations()
    console.debug(
      `[${this.syncCount}] Syncing ${declarations.length} declarations`
    )
    for (const declaration of declarations) {
      const submissionStatus = declaration.submissionStatus
      if (submissionStatus && isReadyStatus(submissionStatus)) {
        this.store.dispatch(
          declarationReadyForStatusChange({
            ...declaration,
            submissionStatus
          })
        )
      }
    }

    this.syncRunning = false
    console.debug(`[${this.syncCount}] Finish sync.`)
  }
}
