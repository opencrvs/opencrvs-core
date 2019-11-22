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
import {
  Event,
  IFormData,
  IFormFieldValue,
  Action as ApplicationAction,
  IForm
} from '@client/forms'
import { Action as NavigationAction, GO_TO_PAGE } from '@client/navigation'
import { storage } from '@client/storage'
import { IUserDetails } from '@client/utils/userUtils'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import { v4 as uuid } from 'uuid'
import { IQueryData } from '@client/views/RegistrationHome/RegistrationHome'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import { getQueryMapping } from '@client/views/DataProvider/QueryProvider'
import { client } from '@client/utils/apolloClient'
import { gqlToDraftTransformer } from '@client/transformer'
import { getRegisterForm } from '@client/forms/register/application-selectors'
import { IStoreState } from '@client/store'
import { ApolloQueryResult, ApolloError } from 'apollo-client'

const SET_INITIAL_APPLICATION = 'APPLICATION/SET_INITIAL_APPLICATION'
const STORE_APPLICATION = 'APPLICATION/STORE_APPLICATION'
const MODIFY_APPLICATION = 'APPLICATION/MODIFY_DRAFT'
const WRITE_APPLICATION = 'APPLICATION/WRITE_DRAFT'
const DELETE_APPLICATION = 'APPLICATION/DELETE_DRAFT'
const GET_APPLICATIONS_SUCCESS = 'APPLICATION/GET_DRAFTS_SUCCESS'
const GET_APPLICATIONS_FAILED = 'APPLICATION/GET_DRAFTS_FAILED'
const ENQUEUE_DOWNLOAD_APPLICATION = 'APPLICATION/ENQUEUE_DOWNLOAD_APPLICATION'
const DOWNLOAD_APPLICATION_SUCCESS = 'APPLICATION/DOWNLOAD_APPLICATION_SUCCESS'
const DOWNLOAD_APPLICATION_FAIL = 'APPLICATION/DOWNLOAD_APPLICATION_FAIL'

export enum SUBMISSION_STATUS {
  DRAFT = 'DRAFT',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTING = 'SUBMITTING',
  SUBMITTED = 'SUBMITTED',
  READY_TO_APPROVE = 'READY_TO_APPROVE',
  APPROVING = 'APPROVING',
  APPROVED = 'APPROVED',
  READY_TO_REGISTER = 'READY_TO_REGISTER',
  REGISTERING = 'REGISTERING',
  REGISTERED = 'REGISTERED',
  READY_TO_REJECT = 'READY_TO_REJECT',
  REJECTING = 'REJECTING',
  REJECTED = 'REJECTED',
  READY_TO_CERTIFY = 'READY_TO_CERTIFY',
  CERTIFYING = 'CERTIFYING',
  CERTIFIED = 'CERTIFIED',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK'
}

export enum DOWNLOAD_STATUS {
  READY_TO_DOWNLOAD = 'READY_TO_DOWNLOAD',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK'
}

export const processingStates = [
  SUBMISSION_STATUS.READY_TO_SUBMIT,
  SUBMISSION_STATUS.SUBMITTING,
  SUBMISSION_STATUS.READY_TO_APPROVE,
  SUBMISSION_STATUS.APPROVING,
  SUBMISSION_STATUS.READY_TO_REGISTER,
  SUBMISSION_STATUS.REGISTERING,
  SUBMISSION_STATUS.READY_TO_REJECT,
  SUBMISSION_STATUS.REJECTING,
  SUBMISSION_STATUS.READY_TO_CERTIFY,
  SUBMISSION_STATUS.CERTIFYING
]

const DOWNLOAD_MAX_RETRY_ATTEMPT = 3
interface IActionList {
  [key: string]: string
}

const ACTION_LIST: IActionList = {
  [ApplicationAction.LOAD_REVIEW_APPLICATION]:
    ApplicationAction.LOAD_REVIEW_APPLICATION,
  [ApplicationAction.LOAD_CERTIFICATE_APPLICATION]:
    ApplicationAction.LOAD_CERTIFICATE_APPLICATION
}

export interface IPayload {
  [key: string]: IFormFieldValue
}

export interface IVisitedGroupId {
  sectionId: string
  groupId: string
}

export interface IApplication {
  id: string
  data: IFormData
  savedOn?: number
  modifiedOn?: number
  eventType?: string
  review?: boolean
  event: Event
  registrationStatus?: string
  submissionStatus?: string
  downloadStatus?: string
  downloadRetryAttempt?: number
  action?: string
  trackingId?: string
  compositionId?: string
  registrationNumber?: string
  payload?: IPayload
  visitedGroupIds?: IVisitedGroupId[]
  timeLoggedMS?: number
}

type Relation =
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'EXTENDED_FAMILY'
  | 'OTHER'
  | 'INFORMANT'

export type ICertificate = {
  collector?: Partial<{ type: Relation }>
  hasShowedVerifiedDocument?: boolean
  payments?: Payment
  data?: string
}

/*
 * This type represents a submitted application that we've received from the API
 * It provides a more strict alternative to IApplication with fields we know should always exist
 */
export interface IPrintableApplication extends Omit<IApplication, 'data'> {
  data: {
    father: {
      fathersDetailsExist: boolean
      [key: string]: IFormFieldValue
    }
    registration: {
      _fhirID: string
      presentAtBirthRegistration: Relation
      whoseContactDetails: string
      registrationPhone: string
      trackingId: string
      registrationNumber: string
      certificates: ICertificate[]
      [key: string]: IFormFieldValue
    }
  } & Exclude<IApplication['data'], 'father' | 'registration'>
}

type PaymentType = 'MANUAL'

type PaymentOutcomeType = 'COMPLETED' | 'ERROR' | 'PARTIAL'

type Payment = {
  paymentId?: string
  type: PaymentType
  total: string
  amount: string
  outcome: PaymentOutcomeType
  date: number
}

interface IStoreApplicationAction {
  type: typeof STORE_APPLICATION
  payload: { application: IApplication }
}

interface IModifyApplicationAction {
  type: typeof MODIFY_APPLICATION
  payload: {
    application: IApplication | IPrintableApplication
  }
}

export interface IWriteApplicationAction {
  type: typeof WRITE_APPLICATION
  payload: {
    application: IApplication | IPrintableApplication
  }
}

interface ISetInitialApplicationsAction {
  type: typeof SET_INITIAL_APPLICATION
}

interface IDeleteApplicationAction {
  type: typeof DELETE_APPLICATION
  payload: {
    application: IApplication | IPrintableApplication
  }
}

interface IGetStorageApplicationsSuccessAction {
  type: typeof GET_APPLICATIONS_SUCCESS
  payload: string
}

interface IGetStorageApplicationsFailedAction {
  type: typeof GET_APPLICATIONS_FAILED
}

interface IDownloadApplication {
  type: typeof ENQUEUE_DOWNLOAD_APPLICATION
  payload: {
    application: IApplication
  }
}

interface IDownloadApplicationSuccess {
  type: typeof DOWNLOAD_APPLICATION_SUCCESS
  payload: {
    queryData: any
    form: {
      [key in Event]: IForm
    }
  }
}

interface IDownloadApplicationFail {
  type: typeof DOWNLOAD_APPLICATION_FAIL
  payload: {
    error: ApolloError
    application: IApplication
  }
}

interface IApplicationRequestQueue {
  id: string
  action: Action
}
export type Action =
  | IStoreApplicationAction
  | IModifyApplicationAction
  | ISetInitialApplicationsAction
  | IWriteApplicationAction
  | NavigationAction
  | IDeleteApplicationAction
  | IGetStorageApplicationsSuccessAction
  | IGetStorageApplicationsFailedAction
  | IDownloadApplication
  | IDownloadApplicationSuccess
  | IDownloadApplicationFail

export interface IUserData {
  userID: string
  userPIN?: string
  applications: IApplication[]
}

export interface IApplicationsState {
  userID: string
  applications: IApplication[]
  initialApplicationsLoaded: boolean
}

const initialState = {
  userID: '',
  applications: [],
  initialApplicationsLoaded: false
}

export function createApplication(event: Event, initialData?: IFormData) {
  return {
    id: uuid(),
    data: initialData || {},
    event,
    submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
  }
}

export function makeApplicationReadyToDownload(
  event: Event,
  compositionId: string,
  action: string
): IApplication {
  return {
    id: compositionId,
    data: {},
    event,
    compositionId,
    action,
    downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
  }
}

export function createReviewApplication(
  applicationId: string,
  formData: IFormData,
  event: Event,
  status?: string
): IApplication {
  return {
    id: applicationId,
    data: formData,
    review: true,
    event,
    registrationStatus: status
  }
}

export function storeApplication(
  application: IApplication
): IStoreApplicationAction {
  application.savedOn = Date.now()
  return { type: STORE_APPLICATION, payload: { application } }
}

export function modifyApplication(
  application: IApplication | IPrintableApplication
): IModifyApplicationAction {
  application.modifiedOn = Date.now()
  return { type: MODIFY_APPLICATION, payload: { application } }
}
export function setInitialApplications() {
  return { type: SET_INITIAL_APPLICATION }
}

export const getStorageApplicationsSuccess = (
  response: string
): IGetStorageApplicationsSuccessAction => ({
  type: GET_APPLICATIONS_SUCCESS,
  payload: response
})

export const getStorageApplicationsFailed = (): IGetStorageApplicationsFailedAction => ({
  type: GET_APPLICATIONS_FAILED
})

export function deleteApplication(
  application: IApplication | IPrintableApplication
): IDeleteApplicationAction {
  return { type: DELETE_APPLICATION, payload: { application } }
}

export function writeApplication(
  application: IApplication | IPrintableApplication
): IWriteApplicationAction {
  return { type: WRITE_APPLICATION, payload: { application } }
}

export async function getCurrentUserID(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')
  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as IUserDetails).userMgntUserID || ''
}

export async function getApplicationsOfCurrentUser(): Promise<string> {
  // returns a 'stringified' IUserData
  const storageTable = await storage.getItem('USER_DATA')
  if (!storageTable) {
    return JSON.stringify({ applications: [] })
  }

  const currentUserID = await getCurrentUserID()
  const allUserData = JSON.parse(storageTable) as IUserData[]
  if (!allUserData.length) {
    // No user-data at all
    const payloadWithoutApplications: IUserData = {
      userID: currentUserID,
      applications: []
    }
    return JSON.stringify(payloadWithoutApplications)
  }

  const currentUserData = allUserData.find(
    uData => uData.userID === currentUserID
  )
  const currentUserApplications: IApplication[] =
    (currentUserData && currentUserData.applications) || []
  const payload: IUserData = {
    userID: currentUserID,
    applications: currentUserApplications
  }
  return JSON.stringify(payload)
}

export async function writeApplicationByUser(
  userId: string,
  application: IApplication
): Promise<string> {
  const uID = userId || (await getCurrentUserID())
  const userData = await storage.getItem('USER_DATA')
  if (!userData) {
    // No storage option found
    storage.configStorage('OpenCRVS')
  }
  const allUserData: IUserData[] = !userData
    ? []
    : (JSON.parse(userData) as IUserData[])
  let currentUserData = allUserData.find(uData => uData.userID === uID)

  const existingApplicationId = currentUserData
    ? currentUserData.applications.findIndex(app => app.id === application.id)
    : -1

  if (existingApplicationId >= 0) {
    currentUserData &&
      currentUserData.applications.splice(existingApplicationId, 1)
  }

  if (currentUserData) {
    currentUserData.applications.push(application)
  } else {
    currentUserData = {
      userID: uID,
      applications: [application]
    }
    allUserData.push(currentUserData)
  }
  storage.setItem('USER_DATA', JSON.stringify(allUserData))

  return JSON.stringify(currentUserData)
}

export async function deleteApplicationByUser(
  userId: string,
  application: IApplication
): Promise<string> {
  const uID = userId || (await getCurrentUserID())
  const userData = await storage.getItem('USER_DATA')
  if (!userData) {
    // No storage option found
    storage.configStorage('OpenCRVS')
  }
  const allUserData: IUserData[] = !userData
    ? []
    : (JSON.parse(userData) as IUserData[])
  const currentUserData = allUserData.find(uData => uData.userID === uID)

  const deletedApplicationId = currentUserData
    ? currentUserData.applications.findIndex(app => app.id === application.id)
    : -1

  if (deletedApplicationId >= 0) {
    currentUserData &&
      currentUserData.applications.splice(deletedApplicationId, 1)
    storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }

  return JSON.stringify(currentUserData)
}

export function downloadApplication(
  application: IApplication
): IDownloadApplication {
  return {
    type: ENQUEUE_DOWNLOAD_APPLICATION,
    payload: {
      application
    }
  }
}

function createRequestForApplication(application: IApplication) {
  const applicationAction = ACTION_LIST[application.action as string] || null
  const result = getQueryMapping(
    application.event,
    applicationAction as ApplicationAction
  )
  const { query } = result || {
    query: null
  }

  return {
    request: client.query,
    requestArgs: [{ query, variables: { id: application.id } }]
  }
}

function requestWithStateWrapper(
  mainRequest: Promise<ApolloQueryResult<any>>,
  getState: () => IStoreState
) {
  const store = getState()
  return new Promise(async (resolve, reject) => {
    try {
      const data = await mainRequest
      resolve({ data, store })
    } catch (error) {
      reject(error)
    }
  })
}

function getDataKey(application: IApplication) {
  const result = getQueryMapping(
    application.event,
    application.action as ApplicationAction
  )

  const { dataKey } = result || { dataKey: null }
  return dataKey
}

function downloadApplicationSuccess({
  data,
  store
}: {
  data: any
  store: IStoreState
}): IDownloadApplicationSuccess {
  const form = getRegisterForm(store)

  return {
    type: DOWNLOAD_APPLICATION_SUCCESS,
    payload: {
      queryData: data,
      form
    }
  }
}

function downloadApplicationFail(
  error: ApolloError,
  application: IApplication
): IDownloadApplicationFail {
  return {
    type: DOWNLOAD_APPLICATION_FAIL,
    payload: {
      error,
      application
    }
  }
}

export const applicationsReducer: LoopReducer<IApplicationsState, Action> = (
  state: IApplicationsState = initialState,
  action: Action
): IApplicationsState | Loop<IApplicationsState, Action> => {
  switch (action.type) {
    case GO_TO_PAGE: {
      const application = state.applications.find(
        ({ id }) => id === action.payload.applicationId
      )

      if (!application || application.data[action.payload.pageId]) {
        return state
      }
      const modifiedApplication = {
        ...application,
        data: {
          ...application.data,
          [action.payload.pageId]: {}
        }
      }
      return loop(state, Cmd.action(modifyApplication(modifiedApplication)))
    }
    case STORE_APPLICATION:
      return {
        ...state,
        applications: state.applications
          ? state.applications.concat(action.payload.application)
          : [action.payload.application]
      }
    case DELETE_APPLICATION:
      return loop(
        {
          ...state
        },
        Cmd.run(deleteApplicationByUser, {
          successActionCreator: getStorageApplicationsSuccess,
          failActionCreator: getStorageApplicationsFailed,
          args: [state.userID, action.payload.application]
        })
      )
    case MODIFY_APPLICATION:
      const newApplications: IApplication[] = state.applications || []
      const currentApplicationIndex = newApplications.findIndex(
        application => application.id === action.payload.application.id
      )
      newApplications[currentApplicationIndex] = action.payload.application
      return {
        ...state,
        applications: newApplications
      }
    case WRITE_APPLICATION:
      return loop(
        {
          ...state
        },
        Cmd.run(writeApplicationByUser, {
          successActionCreator: getStorageApplicationsSuccess,
          failActionCreator: getStorageApplicationsFailed,
          args: [state.userID, action.payload.application]
        })
      )
    case SET_INITIAL_APPLICATION:
      return loop(
        {
          ...state
        },
        Cmd.run<
          IGetStorageApplicationsFailedAction,
          IGetStorageApplicationsSuccessAction
        >(getApplicationsOfCurrentUser, {
          successActionCreator: getStorageApplicationsSuccess,
          failActionCreator: getStorageApplicationsFailed,
          args: []
        })
      )
    case GET_APPLICATIONS_SUCCESS:
      if (action.payload) {
        const userData = JSON.parse(action.payload) as IUserData
        return {
          ...state,
          userID: userData.userID,
          applications: userData.applications,
          initialApplicationsLoaded: true
        }
      }
      return {
        ...state,
        initialApplicationsLoaded: true
      }
    case ENQUEUE_DOWNLOAD_APPLICATION:
      const { applications } = state
      const { application } = action.payload
      const downloadIsRunning = applications.some(
        application =>
          application.downloadStatus === DOWNLOAD_STATUS.DOWNLOADING
      )

      const applicationIndex = applications.findIndex(
        app => application.id === app.id
      )
      let newApplicationsAfterStartingDownload = Array.from(applications)

      // Download is running, so enqueue
      if (downloadIsRunning) {
        // Application is not in list
        if (applicationIndex === -1) {
          newApplicationsAfterStartingDownload = applications.concat([
            application
          ])
        } else {
          // Application is failed before, just make it ready to download
          newApplicationsAfterStartingDownload[applicationIndex] = application
        }

        // Download is running just return the state
        return {
          ...state,
          applications: newApplicationsAfterStartingDownload
        }
      }
      // Download is not running
      else {
        // Application is not in list, so push it
        if (applicationIndex === -1) {
          newApplicationsAfterStartingDownload = applications.concat([
            {
              ...application,
              downloadStatus: DOWNLOAD_STATUS.DOWNLOADING
            }
          ])
        }
        // Application is in list make it downloading
        else {
          newApplicationsAfterStartingDownload[applicationIndex] = {
            ...application,
            downloadStatus: DOWNLOAD_STATUS.DOWNLOADING
          }
        }
      }

      const newState = {
        ...state,
        applications: newApplicationsAfterStartingDownload
      }

      const { request, requestArgs } = createRequestForApplication(application)

      return loop(
        newState,
        Cmd.run<IDownloadApplicationFail, IDownloadApplicationSuccess>(
          requestWithStateWrapper,
          {
            args: [request(...requestArgs), Cmd.getState],
            successActionCreator: downloadApplicationSuccess,
            failActionCreator: err =>
              downloadApplicationFail(err, {
                ...application,
                downloadStatus: DOWNLOAD_STATUS.DOWNLOADING
              })
          }
        )
      )
    case DOWNLOAD_APPLICATION_SUCCESS:
      const { queryData, form } = action.payload

      const downloadingApplicationIndex = state.applications.findIndex(
        application =>
          application.downloadStatus === DOWNLOAD_STATUS.DOWNLOADING
      )
      const newApplicationsAfterDownload = Array.from(state.applications)
      const downloadingApplication =
        newApplicationsAfterDownload[downloadingApplicationIndex]

      const dataKey = getDataKey(downloadingApplication)
      const transData = gqlToDraftTransformer(
        form[downloadingApplication.event],
        queryData.data[dataKey as string]
      )
      newApplicationsAfterDownload[
        downloadingApplicationIndex
      ] = createReviewApplication(
        downloadingApplication.id,
        transData,
        downloadingApplication.event
      )
      newApplicationsAfterDownload[downloadingApplicationIndex].downloadStatus =
        DOWNLOAD_STATUS.DOWNLOADED

      const newStateAfterDownload = {
        ...state,
        applications: newApplicationsAfterDownload
      }

      // Check if there is more to download
      const downloadQueueInprogress = state.applications.filter(
        application =>
          application.downloadStatus === DOWNLOAD_STATUS.READY_TO_DOWNLOAD
      )

      // If not then, write to IndexedDB and return state
      if (!downloadQueueInprogress.length) {
        return loop(
          newStateAfterDownload,
          Cmd.run(writeApplicationByUser, {
            args: [
              state.userID,
              newApplicationsAfterDownload[downloadingApplicationIndex]
            ],
            failActionCreator: err =>
              downloadApplicationFail(
                err,
                newApplicationsAfterDownload[downloadingApplicationIndex]
              )
          })
        )
      }

      const applicationToDownload = downloadQueueInprogress[0]
      applicationToDownload.downloadStatus = DOWNLOAD_STATUS.DOWNLOADING
      const {
        request: nextRequest,
        requestArgs: nextRequestArgs
      } = createRequestForApplication(applicationToDownload)

      // Return state, write to indexedDBand download the next ready to download application, all in sequence
      return loop(
        newStateAfterDownload,
        Cmd.list(
          [
            Cmd.run(writeApplicationByUser, {
              args: [
                state.userID,
                newApplicationsAfterDownload[downloadingApplicationIndex]
              ],
              failActionCreator: downloadApplicationFail
            }),
            Cmd.run<IDownloadApplicationFail, IDownloadApplicationSuccess>(
              requestWithStateWrapper,
              {
                args: [nextRequest(...nextRequestArgs), Cmd.getState],
                successActionCreator: downloadApplicationSuccess,
                failActionCreator: err =>
                  downloadApplicationFail(
                    err,
                    newApplicationsAfterDownload[downloadingApplicationIndex]
                  )
              }
            )
          ],
          { sequence: true }
        )
      )

    case DOWNLOAD_APPLICATION_FAIL:
      const { application: erroredApplication, error } = action.payload
      erroredApplication.downloadRetryAttempt =
        (erroredApplication.downloadRetryAttempt || 0) + 1

      const {
        request: retryRequest,
        requestArgs: retryRequestArgs
      } = createRequestForApplication(erroredApplication)

      const applicationsAfterError = Array.from(state.applications)
      const erroredApplicationIndex = applicationsAfterError.findIndex(
        application =>
          application.downloadStatus === DOWNLOAD_STATUS.DOWNLOADING
      )

      applicationsAfterError[erroredApplicationIndex] = erroredApplication

      // Retry download if not limit reached
      if (
        erroredApplication.downloadRetryAttempt < DOWNLOAD_MAX_RETRY_ATTEMPT
      ) {
        return loop(
          {
            ...state,
            applications: applicationsAfterError
          },
          Cmd.run<IDownloadApplicationFail, IDownloadApplicationSuccess>(
            requestWithStateWrapper,
            {
              args: [retryRequest(...retryRequestArgs), Cmd.getState],
              successActionCreator: downloadApplicationSuccess,
              failActionCreator: err =>
                downloadApplicationFail(err, erroredApplication)
            }
          )
        )
      }

      let status
      if (error.networkError) {
        status = DOWNLOAD_STATUS.FAILED_NETWORK
      } else {
        status = DOWNLOAD_STATUS.FAILED
      }

      erroredApplication.downloadStatus = status

      applicationsAfterError[erroredApplicationIndex] = erroredApplication

      const downloadQueueFollowing = state.applications.filter(
        application =>
          application.downloadStatus === DOWNLOAD_STATUS.READY_TO_DOWNLOAD
      )

      // If nothing more to download, return the state and write the applications
      if (!downloadQueueFollowing.length) {
        return loop(
          {
            ...state,
            applications: applicationsAfterError
          },
          Cmd.run(() =>
            writeApplicationByUser(state.userID, erroredApplication)
          )
        )
      }

      // If there are more to download in queue, start the next request
      const nextApplication = downloadQueueFollowing[0]
      const {
        request: nextApplicationRequest,
        requestArgs: nextApplicationRequestArgs
      } = createRequestForApplication(nextApplication)
      return loop(
        {
          ...state,
          applications: applicationsAfterError
        },
        Cmd.list(
          [
            Cmd.run(() =>
              writeApplicationByUser(state.userID, erroredApplication)
            ),
            Cmd.run(requestWithStateWrapper, {
              args: [
                nextApplicationRequest(...nextApplicationRequestArgs),
                Cmd.getState
              ],
              successActionCreator: downloadApplicationSuccess,
              failActionCreator: err =>
                downloadApplicationFail(err, nextApplication)
            })
          ],
          { sequence: true }
        )
      )

    default:
      return state
  }
}

export function filterProcessingApplications(
  data: GQLEventSearchResultSet,
  processingApplicationIds: string[]
): GQLEventSearchResultSet {
  if (!data.results) {
    return data
  }

  const filteredResults = data.results.filter(result => {
    if (result === null) {
      return false
    }

    return !processingApplicationIds.includes(result.id)
  })
  const filteredTotal =
    (data.totalItems || 0) - (data.results.length - filteredResults.length)

  return {
    results: filteredResults,
    totalItems: filteredTotal
  }
}

export function filterProcessingApplicationsFromQuery(
  queryData: IQueryData,
  storedApplications: IApplication[]
): IQueryData {
  const processingApplicationIds = storedApplications
    .filter(
      application =>
        application.submissionStatus &&
        processingStates.includes(
          application.submissionStatus as SUBMISSION_STATUS
        )
    )
    .map(application => application.id)

  return {
    inProgressTab: filterProcessingApplications(
      queryData.inProgressTab,
      processingApplicationIds
    ),
    reviewTab: filterProcessingApplications(
      queryData.reviewTab,
      processingApplicationIds
    ),
    rejectTab: filterProcessingApplications(
      queryData.rejectTab,
      processingApplicationIds
    ),
    approvalTab: filterProcessingApplications(
      queryData.approvalTab,
      processingApplicationIds
    ),
    printTab: filterProcessingApplications(
      queryData.printTab,
      processingApplicationIds
    )
  }
}
