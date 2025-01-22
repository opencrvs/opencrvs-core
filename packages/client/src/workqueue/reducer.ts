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
  DOWNLOAD_STATUS,
  RemoveUnassignedDeclarationsActionCreator
} from '@client/declarations'
import { IStoreState } from '@client/store'
import { getUserDetails, getScope } from '@client/profile/profileSelectors'
import { getUserLocation, UserDetails } from '@client/utils/userUtils'
import { syncRegistrarWorkqueue } from '@client/ListSyncController'
import type { GQLEventSearchSet } from '@client/utils/gateway-deprecated-do-not-use'
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
  UPDATE_WORKQUEUE_PAGINATION,
  IQueryData
} from './actions'
import { SCOPES } from '@opencrvs/commons/client'

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

interface IWorkqueuePaginationParams {
  pageSize: number
  inProgressSkip: number
  healthSystemSkip: number
  reviewSkip: number
  rejectSkip: number
  sentForReviewSkip: number
  approvalSkip: number
  externalValidationSkip: number
  printSkip: number
  issueSkip: number
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

async function getFilteredDeclarations(
  workqueue: IWorkqueue,
  getState: () => IStoreState
): Promise<{
  currentlyDownloadedDeclarations: IDeclaration[]
  unassignedDeclarations: IDeclaration[]
}> {
  const state = getState()
  const savedDeclarations = state.declarationsState.declarations

  const workqueueDeclarations = Object.entries(workqueue.data).flatMap(
    (queryData) => {
      return queryData[1].results
    }
  ) as Array<GQLEventSearchSet | null>

  const unassignedDeclarations = workqueueDeclarations
    .filter(
      (dec) =>
        dec &&
        hasStatusChanged(dec, savedDeclarations) &&
        isNotSubmittingOrDownloading(dec, savedDeclarations)
    )
    .map((dec) => savedDeclarations.find((d) => d.id === dec?.id))
    .filter((maybeDeclaration): maybeDeclaration is IDeclaration =>
      Boolean(maybeDeclaration)
    )

  const unassignedDeclarationIds = unassignedDeclarations.map(
    (unassigned) => unassigned.id
  )
  const currentlyDownloadedDeclarations = savedDeclarations.filter(
    (dec) => !unassignedDeclarationIds.includes(dec.id)
  )

  // don't need to update indexDb if there are no unassigned declarations
  if (unassignedDeclarations.length === 0)
    return {
      currentlyDownloadedDeclarations: savedDeclarations,
      unassignedDeclarations
    }

  const uID = await getCurrentUserID()
  const userData = await getUserData(uID)
  const { allUserData } = userData
  let { currentUserData } = userData
  if (currentUserData) {
    currentUserData.declarations = currentlyDownloadedDeclarations
  } else {
    currentUserData = {
      userID: uID,
      declarations: currentlyDownloadedDeclarations,
      workqueue
    }
    allUserData.push(currentUserData)
  }

  await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  return { currentlyDownloadedDeclarations, unassignedDeclarations }
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

function isNotSubmittingOrDownloading(
  workqueueDeclaration: GQLEventSearchSet,
  savedDeclarations: IDeclaration[]
) {
  const declarationInStore = savedDeclarations.find(
    (dec) => dec.id === workqueueDeclaration.id
  )

  if (
    declarationInStore &&
    declarationInStore.downloadStatus &&
    [DOWNLOAD_STATUS.DOWNLOADING, DOWNLOAD_STATUS.READY_TO_DOWNLOAD].includes(
      declarationInStore.downloadStatus
    )
  ) {
    return false
  }

  if (declarationInStore?.submissionStatus)
    return !Boolean(
      [
        SUBMISSION_STATUS.SUBMITTING,
        SUBMISSION_STATUS.APPROVING,
        SUBMISSION_STATUS.REGISTERING,
        SUBMISSION_STATUS.REJECTING,
        SUBMISSION_STATUS.ARCHIVING,
        SUBMISSION_STATUS.CERTIFYING,
        SUBMISSION_STATUS.ISSUING,
        SUBMISSION_STATUS.REQUESTING_CORRECTION,
        SUBMISSION_STATUS.READY_TO_CERTIFY,
        SUBMISSION_STATUS.READY_TO_ISSUE
      ].includes(declarationInStore.submissionStatus as SUBMISSION_STATUS)
    )
  return true
}

function hasStatusChanged(
  currentDeclaration: GQLEventSearchSet,
  savedDeclarations: IDeclaration[]
) {
  const currentDeclarationStatus = currentDeclaration?.registration?.status
  const declarationStatusInStore = savedDeclarations.find(
    (dec) => dec.id === currentDeclaration?.id
  )?.registrationStatus

  if (!declarationStatusInStore) return false

  return currentDeclarationStatus !== declarationStatusInStore
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
    scope && scope.includes(SCOPES.RECORD_REGISTER)
      ? [
          EVENT_STATUS.DECLARED,
          EVENT_STATUS.VALIDATED,
          EVENT_STATUS.CORRECTION_REQUESTED
        ]
      : [EVENT_STATUS.DECLARED]

  const {
    pageSize,
    inProgressSkip,
    healthSystemSkip,
    reviewSkip,
    rejectSkip,
    approvalSkip,
    sentForReviewSkip,
    externalValidationSkip,
    printSkip,
    issueSkip
  } = workqueuePaginationParams

  const result = await syncRegistrarWorkqueue(
    userDetails.practitionerId,
    registrationLocationId,
    reviewStatuses,
    pageSize,
    inProgressSkip,
    healthSystemSkip,
    reviewSkip,
    rejectSkip,
    sentForReviewSkip,
    approvalSkip,
    externalValidationSkip,
    printSkip,
    issueSkip
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
        sentForReviewTab,
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
        sentForReviewSkip: Math.max(sentForReviewTab - 1, 0) * pageSize,
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
        return loop(
          {
            ...state,
            workqueue
          },
          Cmd.run(getFilteredDeclarations, {
            successActionCreator: RemoveUnassignedDeclarationsActionCreator,
            args: [workqueue, Cmd.getState]
          })
        )
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
