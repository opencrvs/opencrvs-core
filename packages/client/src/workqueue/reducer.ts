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
import {
  UpdateRegistrarWorkqueueAction,
  UPDATE_REGISTRAR_WORKQUEUE,
  IQueryData
} from './actions'

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED',
  WAITING_VALIDATION: 'WAITING_VALIDATION',
  CORRECTION_REQUESTED: 'CORRECTION_REQUESTED'
}

export interface IWorkqueue {
  loading?: boolean
  error?: boolean
  data: IQueryData
  initialSyncDone: boolean
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
