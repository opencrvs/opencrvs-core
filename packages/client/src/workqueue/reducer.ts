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
import { Loop, LoopReducer } from 'redux-loop'
import {
  IQueryData,
  UPDATE_REGISTRAR_WORKQUEUE,
  UpdateRegistrarWorkqueueAction,
  WorkqueueActions
} from './actions'

export interface IWorkqueue {
  loading?: boolean
  error?: boolean
  data: IQueryData
  initialSyncDone: boolean
}

export interface WorkqueueState {
  workqueue: IWorkqueue
  pagination: Record<keyof IQueryData, number>
}

const workqueueInitialState: WorkqueueState = {
  workqueue: {
    loading: true,
    error: false,
    data: {
      inProgressTab: { totalItems: 0, results: [] },
      notificationTab: { totalItems: 0, results: [] },
      reviewTab: { totalItems: 0, results: [] },
      rejectTab: { totalItems: 0, results: [] },
      sentForReviewTab: { totalItems: 0, results: [] },
      approvalTab: { totalItems: 0, results: [] },
      printTab: { totalItems: 0, results: [] },
      issueTab: { totalItems: 0, results: [] },
      externalValidationTab: { totalItems: 0, results: [] }
    },
    initialSyncDone: false
  },
  pagination: {
    inProgressTab: 1,
    notificationTab: 1,
    reviewTab: 1,
    rejectTab: 1,
    sentForReviewTab: 1,
    approvalTab: 1,
    externalValidationTab: 1,
    printTab: 1,
    issueTab: 1
  }
}

export function updateRegistrarWorkqueue(
  userId?: string,
  pageSize = 10
): UpdateRegistrarWorkqueueAction {
  return {
    type: UPDATE_REGISTRAR_WORKQUEUE,
    payload: {
      userId,
      pageSize
    }
  }
}

export const workqueueReducer: LoopReducer<WorkqueueState, WorkqueueActions> = (
  state: WorkqueueState = workqueueInitialState
): WorkqueueState | Loop<WorkqueueState, WorkqueueActions> => {
  return state
}
