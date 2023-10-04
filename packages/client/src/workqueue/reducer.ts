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
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import { USER_DETAILS_AVAILABLE } from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  getCurrentUserID,
  IUserData,
  getUserData,
  IDeclaration,
  SUBMISSION_STATUS,
  updateWorkqueueData,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { IStoreState } from '@client/store'
import { getUserDetails, getScope } from '@client/profile/profileSelectors'
import { getUserLocation, UserDetails } from '@client/utils/userUtils'
import { syncRegistrarWorkqueue } from '@client/ListSyncController'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import {
  UpdateRegistrarWorkqueueAction,
  UPDATE_REGISTRAR_WORKQUEUE,
  WorkqueueActions,
  updateRegistrarWorkqueueSuccessActionCreator,
  updateRegistrarWorkqueueFailActionCreator,
  IGetWorkqueueOfCurrentUserFailedAction,
  IGetWorkqueueOfCurrentUserSuccessAction,
  getCurrentUserWorkqueuSuccess,
  getCurrentUserWorkqueueFailed,
  GET_WORKQUEUE_SUCCESS,
  UPDATE_REGISTRAR_WORKQUEUE_SUCCESS,
  UPDATE_WORKQUEUE_PAGINATION
} from './actions'

export interface IQueryData {
  inProgressTab: GQLEventSearchResultSet
  notificationTab: GQLEventSearchResultSet
  reviewTab: GQLEventSearchResultSet
  rejectTab: GQLEventSearchResultSet
  approvalTab: GQLEventSearchResultSet
  printTab: GQLEventSearchResultSet
  issueTab: GQLEventSearchResultSet
  externalValidationTab: GQLEventSearchResultSet
}

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

export interface WorkqueueState {
  workqueue: IWorkqueue
  pagination: Record<keyof IQueryData, number>
}

export const workqueueInitialState: WorkqueueState = {
  workqueue: {
    loading: true,
    error: false,
    data: {
      inProgressTab: { totalItems: 0, results: [] },
      notificationTab: { totalItems: 0, results: [] },
      reviewTab: { totalItems: 0, results: [] },
      rejectTab: { totalItems: 0, results: [] },
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
    approvalTab: 1,
    externalValidationTab: 1,
    printTab: 1,
    issueTab: 1
  }
}

interface IWorkqueuePaginationParams {
  userId?: string
  pageSize: number
  isFieldAgent: boolean
  inProgressSkip: number
  healthSystemSkip: number
  reviewSkip: number
  rejectSkip: number
  approvalSkip: number
  externalValidationSkip: number
  printSkip: number
  issueSkip: number
}

export function updateRegistrarWorkqueue(
  userId?: string,
  pageSize = 10,
  isFieldAgent = false
): UpdateRegistrarWorkqueueAction {
  return {
    type: UPDATE_REGISTRAR_WORKQUEUE,
    payload: {
      userId,
      pageSize,
      isFieldAgent
    }
  }
}

async function getWorkqueueOfCurrentUser(): Promise<string> {
  // returns a 'stringified' IWorkqueue
  const initialWorkqueue = workqueueInitialState.workqueue

  const storageTable = await storage.getItem('USER_DATA')
  if (!storageTable) {
    return JSON.stringify(initialWorkqueue)
  }

  const currentUserID = await getCurrentUserID()

  const allUserData = JSON.parse(storageTable) as IUserData[]

  if (!allUserData.length) {
    // No user-data at all
    return JSON.stringify(initialWorkqueue)
  }

  const currentUserData = allUserData.find(
    (uData) => uData.userID === currentUserID
  )
  const currentUserWorkqueue: IWorkqueue =
    (currentUserData && currentUserData.workqueue) ||
    workqueueInitialState.workqueue

  return JSON.stringify(currentUserWorkqueue)
}

function mergeWorkQueueData(
  state: IStoreState,
  workQueueIds: (keyof IQueryData)[],
  currentApplications: IDeclaration[] | undefined,
  destinationWorkQueue: IWorkqueue
) {
  if (!currentApplications) {
    return destinationWorkQueue
  }
  workQueueIds.forEach((workQueueId) => {
    if (
      !(
        destinationWorkQueue.data &&
        destinationWorkQueue.data[workQueueId]?.results
      )
    ) {
      return
    }
    destinationWorkQueue.data[workQueueId].results?.forEach((declaration) => {
      if (declaration == null) {
        return
      }
      const declarationIndex = currentApplications.findIndex(
        (app) => app && app.id === declaration.id
      )
      if (declarationIndex >= 0) {
        const isDownloadFailed =
          currentApplications[declarationIndex].submissionStatus ===
            SUBMISSION_STATUS.FAILED_NETWORK ||
          currentApplications[declarationIndex].submissionStatus ===
            SUBMISSION_STATUS.FAILED ||
          currentApplications[declarationIndex].downloadStatus ===
            DOWNLOAD_STATUS.FAILED_NETWORK ||
          currentApplications[declarationIndex].downloadStatus ===
            DOWNLOAD_STATUS.FAILED

        if (!isDownloadFailed) {
          updateWorkqueueData(
            state,
            currentApplications[declarationIndex],
            workQueueId,
            destinationWorkQueue
          )
        }
      }
    })
  })
  return destinationWorkQueue
}

async function getWorkqueueData(
  state: IStoreState,
  userDetails: UserDetails,
  workqueuePaginationParams: IWorkqueuePaginationParams
) {
  const registrationLocationId =
    (userDetails && getUserLocation(userDetails).id) || ''

  const scope = getScope(state)
  const reviewStatuses =
    scope && scope.includes('register')
      ? [
          EVENT_STATUS.DECLARED,
          EVENT_STATUS.VALIDATED,
          EVENT_STATUS.CORRECTION_REQUESTED
        ]
      : [EVENT_STATUS.DECLARED]

  const {
    userId,
    pageSize,
    isFieldAgent,
    inProgressSkip,
    healthSystemSkip,
    reviewSkip,
    rejectSkip,
    approvalSkip,
    externalValidationSkip,
    printSkip,
    issueSkip
  } = workqueuePaginationParams

  const result = await syncRegistrarWorkqueue(
    registrationLocationId,
    reviewStatuses,
    pageSize,
    isFieldAgent,
    inProgressSkip,
    healthSystemSkip,
    reviewSkip,
    rejectSkip,
    approvalSkip,
    externalValidationSkip,
    printSkip,
    issueSkip,
    userId
  )
  let workqueue
  const { currentUserData } = await getUserData(
    userDetails.userMgntUserID || ''
  )
  const currentWorkqueue = currentUserData?.workqueue
  if (result) {
    workqueue = {
      ...(currentWorkqueue ?? workqueueInitialState.workqueue),
      loading: false,
      error: false,
      data: result,
      initialSyncDone: true
    }
  } else {
    workqueue = {
      ...(currentWorkqueue ?? workqueueInitialState.workqueue),
      loading: false,
      error: true,
      data:
        (currentWorkqueue && currentWorkqueue.data) ||
        (state.workqueueState && state.workqueueState.workqueue.data),
      initialSyncDone: false
    }
  }
  if (isFieldAgent) {
    return mergeWorkQueueData(
      state,
      ['reviewTab', 'rejectTab'],
      currentUserData && currentUserData.declarations,
      workqueue
    )
  }
  return mergeWorkQueueData(
    state,
    ['inProgressTab', 'notificationTab', 'reviewTab', 'rejectTab'],
    currentUserData && currentUserData.declarations,
    workqueue
  )
}

async function writeRegistrarWorkqueueByUser(
  getState: () => IStoreState,
  workqueuePaginationParams: IWorkqueuePaginationParams
): Promise<string> {
  const state = getState()
  const userDetails = getUserDetails(state) as UserDetails

  const workqueue = await getWorkqueueData(
    state,
    userDetails,
    workqueuePaginationParams
  )

  const uID = userDetails.userMgntUserID || ''
  const userData = await getUserData(uID)
  const { allUserData } = userData
  let { currentUserData } = userData

  if (currentUserData) {
    currentUserData.workqueue = workqueue
  } else {
    currentUserData = {
      userID: uID,
      declarations: [],
      workqueue
    }
    allUserData.push(currentUserData)
  }
  return Promise.all([
    storage.setItem('USER_DATA', JSON.stringify(allUserData)),
    JSON.stringify(currentUserData.workqueue)
  ]).then(([_, currentUserWorkqueueData]) => currentUserWorkqueueData)
}

export const workqueueReducer: LoopReducer<WorkqueueState, WorkqueueActions> = (
  state: WorkqueueState = workqueueInitialState,
  action: WorkqueueActions
): WorkqueueState | Loop<WorkqueueState, WorkqueueActions> => {
  switch (action.type) {
    case UPDATE_REGISTRAR_WORKQUEUE:
      const {
        printTab,
        reviewTab,
        approvalTab,
        inProgressTab,
        externalValidationTab,
        rejectTab,
        notificationTab,
        issueTab
      } = state.pagination

      const { pageSize } = action.payload

      const paginationParams: IWorkqueuePaginationParams = {
        ...action.payload,
        inProgressSkip: Math.max(inProgressTab - 1, 0) * pageSize,
        healthSystemSkip: Math.max(notificationTab - 1, 0) * pageSize,
        reviewSkip: Math.max(reviewTab - 1, 0) * pageSize,
        rejectSkip: Math.max(rejectTab - 1, 0) * pageSize,
        approvalSkip: Math.max(approvalTab - 1, 0) * pageSize,
        externalValidationSkip:
          Math.max(externalValidationTab - 1, 0) * pageSize,
        printSkip: Math.max(printTab - 1, 0) * pageSize,
        issueSkip: Math.max(issueTab - 1, 0) * pageSize
      }

      return loop(
        {
          ...state,
          workqueue: {
            ...state.workqueue,
            loading: true
          }
        },
        Cmd.run(writeRegistrarWorkqueueByUser, {
          successActionCreator: updateRegistrarWorkqueueSuccessActionCreator,
          failActionCreator: updateRegistrarWorkqueueFailActionCreator,
          args: [Cmd.getState, paginationParams]
        })
      )

    case USER_DETAILS_AVAILABLE:
      return loop(
        {
          ...state
        },
        Cmd.run<
          IGetWorkqueueOfCurrentUserFailedAction,
          IGetWorkqueueOfCurrentUserSuccessAction
        >(getWorkqueueOfCurrentUser, {
          successActionCreator: getCurrentUserWorkqueuSuccess,
          failActionCreator: getCurrentUserWorkqueueFailed,
          args: []
        })
      )

    case GET_WORKQUEUE_SUCCESS:
      if (action.payload) {
        const workqueue = JSON.parse(action.payload) as IWorkqueue
        return {
          ...state,
          workqueue
        }
      }
      return state

    case UPDATE_REGISTRAR_WORKQUEUE_SUCCESS:
      if (action.payload) {
        const workqueue = JSON.parse(action.payload) as IWorkqueue

        return {
          ...state,
          workqueue
        }
      }
      return state

    case UPDATE_WORKQUEUE_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      }

    default:
      return state
  }
}
