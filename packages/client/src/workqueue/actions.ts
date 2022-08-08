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
import { UserDetailsAvailable } from '@client/profile/profileActions'

export const GET_WORKQUEUE_SUCCESS = 'DECLARATION/GET_WORKQUEUE_SUCCESS'
export const GET_WORKQUEUE_FAILED = 'DECLARATION/GET_WORKQUEUE_FAILED'
export const UPDATE_REGISTRAR_WORKQUEUE =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE'
export const UPDATE_REGISTRAR_WORKQUEUE_SUCCESS =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE_SUCCESS'
export const UPDATE_REGISTRAR_WORKQUEUE_FAIL =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE_FAIL'

interface UpdateRegistrarWorkQueueSuccessAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE_SUCCESS
  payload: string
}

interface UpdateRegistrarWorkQueueFailAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE_FAIL
}

export interface UpdateRegistrarWorkqueueAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE
  payload: {
    pageSize: number
    userId?: string
    isFieldAgent: boolean
    inProgressSkip: number
    healthSystemSkip: number
    reviewSkip: number
    rejectSkip: number
    approvalSkip: number
    externalValidationSkip: number
    printSkip: number
  }
}

export interface IGetWorkqueueOfCurrentUserSuccessAction {
  type: typeof GET_WORKQUEUE_SUCCESS
  payload: string
}

export interface IGetWorkqueueOfCurrentUserFailedAction {
  type: typeof GET_WORKQUEUE_FAILED
}

export const getCurrentUserWorkqueueFailed =
  (): IGetWorkqueueOfCurrentUserFailedAction => ({
    type: GET_WORKQUEUE_FAILED
  })

export const getCurrentUserWorkqueuSuccess = (
  response: string
): IGetWorkqueueOfCurrentUserSuccessAction => ({
  type: GET_WORKQUEUE_SUCCESS,
  payload: response
})

export const updateRegistrarWorkqueueSuccessActionCreator = (
  response: string
): UpdateRegistrarWorkQueueSuccessAction => ({
  type: UPDATE_REGISTRAR_WORKQUEUE_SUCCESS,
  payload: response
})

export const updateRegistrarWorkqueueFailActionCreator =
  (): UpdateRegistrarWorkQueueFailAction => ({
    type: UPDATE_REGISTRAR_WORKQUEUE_FAIL
  })

export type WorkqueueActions =
  | UserDetailsAvailable
  | UpdateRegistrarWorkqueueAction
  | UpdateRegistrarWorkQueueSuccessAction
  | UpdateRegistrarWorkQueueFailAction
  | IGetWorkqueueOfCurrentUserSuccessAction
  | IGetWorkqueueOfCurrentUserFailedAction
