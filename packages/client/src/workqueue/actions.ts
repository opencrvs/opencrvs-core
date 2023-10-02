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
import { UserDetailsAvailable } from '@client/profile/profileActions'
import { IQueryData } from './reducer'

export const GET_WORKQUEUE_SUCCESS = 'DECLARATION/GET_WORKQUEUE_SUCCESS'
export const GET_WORKQUEUE_FAILED = 'DECLARATION/GET_WORKQUEUE_FAILED'
export const UPDATE_REGISTRAR_WORKQUEUE =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE'
export const UPDATE_REGISTRAR_WORKQUEUE_SUCCESS =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE_SUCCESS'
export const UPDATE_REGISTRAR_WORKQUEUE_FAIL =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE_FAIL'
export const UPDATE_WORKQUEUE_PAGINATION =
  'DECLARATION/UPDATE_WORKQUEUE_PAGINATION'

interface UpdateRegistrarWorkQueueSuccessAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE_SUCCESS
  payload: string
}

interface UpdateRegistrarWorkQueueFailAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE_FAIL
}

type IPaginationPayload = Partial<Record<keyof IQueryData, number>>

export interface UpdateWorkqueuePaginationAction {
  type: typeof UPDATE_WORKQUEUE_PAGINATION
  payload: IPaginationPayload
}

export interface UpdateRegistrarWorkqueueAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE
  payload: {
    pageSize: number
    userId?: string
    isFieldAgent: boolean
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

export const updateWorkqueuePagination = (
  payload: IPaginationPayload
): UpdateWorkqueuePaginationAction => ({
  type: UPDATE_WORKQUEUE_PAGINATION,
  payload
})

export type WorkqueueActions =
  | UserDetailsAvailable
  | UpdateWorkqueuePaginationAction
  | UpdateRegistrarWorkqueueAction
  | UpdateRegistrarWorkQueueSuccessAction
  | UpdateRegistrarWorkQueueFailAction
  | IGetWorkqueueOfCurrentUserSuccessAction
  | IGetWorkqueueOfCurrentUserFailedAction
