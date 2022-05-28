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
  Action as DeclarationAction,
  IForm,
  IFormData,
  IFormFieldValue,
  IContactPoint,
  Sort,
  FieldValueMap
} from '@client/forms'
import { Event } from '@client/utils/gateway'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { syncRegistrarWorkqueue } from '@client/ListSyncController'
import { Action as NavigationAction, GO_TO_PAGE } from '@client/navigation'
import {
  UserDetailsAvailable,
  USER_DETAILS_AVAILABLE
} from '@client/profile/profileActions'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { SEARCH_DECLARATIONS_USER_WISE } from '@client/search/queries'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import {
  gqlToDraftTransformer,
  draftToGqlTransformer
} from '@client/transformer'
import { client } from '@client/utils/apolloClient'
import { DECLARED_DECLARATION_SEARCH_QUERY_COUNT } from '@client/utils/constants'
import { transformSearchQueryDataToDraft } from '@client/utils/draftUtils'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import { getQueryMapping } from '@client/views/DataProvider/QueryProvider'
import { EVENT_STATUS, IQueryData } from '@client/views/OfficeHome/OfficeHome'
import {
  GQLEventSearchResultSet,
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLRegistrationSearchSet
} from '@opencrvs/gateway/src/graphql/schema'
import ApolloClient, { ApolloError, ApolloQueryResult } from 'apollo-client'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import { v4 as uuid } from 'uuid'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  showDownloadDeclarationFailedToast,
  ShowDownloadDeclarationFailedToast
} from '@client/notification/actions'
import { getPotentialDuplicateIds } from '@client/transformer/index'

const ARCHIVE_DECLARATION = 'DECLARATION/ARCHIVE'
const SET_INITIAL_DECLARATION = 'DECLARATION/SET_INITIAL_DECLARATION'
const STORE_DECLARATION = 'DECLARATION/STORE_DECLARATION'
const MODIFY_DECLARATION = 'DECLARATION/MODIFY_DRAFT'
const WRITE_DECLARATION = 'DECLARATION/WRITE_DRAFT'
const DELETE_DECLARATION = 'DECLARATION/DELETE_DRAFT'
const REINSTATE_DECLARATION = 'DECLARATION/REINSTATE_DECLARATION'
const GET_DECLARATIONS_SUCCESS = 'DECLARATION/GET_DRAFTS_SUCCESS'
const GET_DECLARATIONS_FAILED = 'DECLARATION/GET_DRAFTS_FAILED'
const GET_WORKQUEUE_SUCCESS = 'DECLARATION/GET_WORKQUEUE_SUCCESS'
const GET_WORKQUEUE_FAILED = 'DECLARATION/GET_WORKQUEUE_FAILED'
const UPDATE_REGISTRAR_WORKQUEUE = 'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE'
const UPDATE_REGISTRAR_WORKQUEUE_SUCCESS =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE_SUCCESS'
const UPDATE_REGISTRAR_WORKQUEUE_FAIL =
  'DECLARATION/UPDATE_REGISTRAR_WORKQUEUE_FAIL'
const ENQUEUE_DOWNLOAD_DECLARATION = 'DECLARATION/ENQUEUE_DOWNLOAD_DECLARATION'
const DOWNLOAD_DECLARATION_SUCCESS = 'DECLARATION/DOWNLOAD_DECLARATION_SUCCESS'
const DOWNLOAD_DECLARATION_FAIL = 'DECLARATION/DOWNLOAD_DECLARATION_FAIL'
const CLEAR_CORRECTION_CHANGE = 'CLEAR_CORRECTION_CHANGE'

export enum SUBMISSION_STATUS {
  DRAFT = 'DRAFT',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTING = 'SUBMITTING',
  VALIDATED = 'VALIDATED',
  DECLARED = 'DECLARED',
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
  READY_TO_ARCHIVE = 'READY_TO_ARCHIVE',
  ARCHIVING = 'ARCHIVING',
  ARCHIVED = 'ARCHIVED',
  READY_TO_CERTIFY = 'READY_TO_CERTIFY',
  REINSTATING = 'REINSTATING',
  REINSTATED = 'REINSTATED',
  READY_TO_REINSTATE = 'READY_TO_REINSTATE',
  CERTIFYING = 'CERTIFYING',
  CERTIFIED = 'CERTIFIED',
  READY_TO_REQUEST_CORRECTION = 'READY_TO_REQUEST_CORRECTION',
  REQUESTING_CORRECTION = 'REQUESTING_CORRECTION',
  REQUESTED_CORRECTION = 'REQUESTED_CORRECTION',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK',
  IN_PROGRESS = 'IN_PROGRESS'
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
  SUBMISSION_STATUS.CERTIFYING,
  SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
  SUBMISSION_STATUS.REQUESTING_CORRECTION
]

const DOWNLOAD_MAX_RETRY_ATTEMPT = 3
interface IActionList {
  [key: string]: string
}

const ACTION_LIST: IActionList = {
  [DeclarationAction.LOAD_REVIEW_DECLARATION]:
    DeclarationAction.LOAD_REVIEW_DECLARATION,
  [DeclarationAction.LOAD_CERTIFICATE_DECLARATION]:
    DeclarationAction.LOAD_CERTIFICATE_DECLARATION,
  [DeclarationAction.LOAD_REQUESTED_CORRECTION_DECLARATION]:
    DeclarationAction.LOAD_REVIEW_DECLARATION
}

export interface IPayload {
  [key: string]: IFormFieldValue
}

export interface IVisitedGroupId {
  sectionId: string
  groupId: string
}

export interface IDeclaration {
  id: string
  data: IFormData
  duplicates?: string[]
  originalData?: IFormData
  savedOn?: number
  createdAt?: string
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

export interface IWorkqueue {
  loading?: boolean
  error?: boolean
  data: IQueryData
  initialSyncDone: boolean
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
  | 'PRINT_IN_ADVANCE'

type RelationForCertificateCorrection =
  | 'FATHER'
  | 'MOTHER'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'EXTENDED_FAMILY'
  | 'OTHER'
  | 'INFORMANT'
  | 'PRINT_IN_ADVANCE'
  | 'CHILD'

export type ICertificate = {
  collector?: Partial<{ type: Relation }>
  corrector?: Partial<{ type: RelationForCertificateCorrection }>
  hasShowedVerifiedDocument?: boolean
  payments?: Payment
  data?: string
}

/*
 * This type represents a submitted declaration that we've received from the API
 * It provides a more strict alternative to IDeclaration with fields we know should always exist
 */
export interface IPrintableDeclaration extends Omit<IDeclaration, 'data'> {
  data: {
    mother: {
      detailsExist: boolean
      [key: string]: IFormFieldValue
    }
    father: {
      detailsExist: boolean
      [key: string]: IFormFieldValue
    }
    registration: {
      _fhirID: string
      informantType: Relation
      whoseContactDetails: string
      registrationPhone: string
      trackingId: string
      registrationNumber: string
      certificates: ICertificate[]
      [key: string]: IFormFieldValue
    }
  } & Exclude<IDeclaration['data'], 'mother' | 'father' | 'registration'>
}

type PaymentType = 'MANUAL'

type PaymentOutcomeType = 'COMPLETED' | 'ERROR' | 'PARTIAL'

type Payment = {
  paymentId?: string
  type: PaymentType
  total: number
  amount: number
  outcome: PaymentOutcomeType
  date: number
}

interface IArchiveDeclarationAction {
  type: typeof ARCHIVE_DECLARATION
  payload: { declarationId: string }
}

interface IStoreDeclarationAction {
  type: typeof STORE_DECLARATION
  payload: { declaration: IDeclaration }
}

interface IModifyDeclarationAction {
  type: typeof MODIFY_DECLARATION
  payload: {
    declaration: IDeclaration | IPrintableDeclaration
  }
}

interface IClearCorrectionChange {
  type: typeof CLEAR_CORRECTION_CHANGE
  payload: {
    declarationId: string
  }
}
export interface IWriteDeclarationAction {
  type: typeof WRITE_DECLARATION
  payload: {
    declaration: IDeclaration | IPrintableDeclaration
    callback?: () => void
  }
}

interface ISetInitialDeclarationsAction {
  type: typeof SET_INITIAL_DECLARATION
}

type OnSuccessDeleteDeclarationOptions = Partial<{
  shouldUpdateFieldAgentHome: boolean
}>
interface IDeleteDeclarationAction {
  type: typeof DELETE_DECLARATION
  payload: {
    declaration: IDeclaration | IPrintableDeclaration
  } & OnSuccessDeleteDeclarationOptions
}
interface IReinstateDeclarationAction {
  type: typeof REINSTATE_DECLARATION
  payload: {
    declarationId: string
  }
}

interface IGetStorageDeclarationsSuccessAction {
  type: typeof GET_DECLARATIONS_SUCCESS
  payload: string
}

interface IGetStorageDeclarationsFailedAction {
  type: typeof GET_DECLARATIONS_FAILED
}

interface IGetWorkqueueOfCurrentUserSuccessAction {
  type: typeof GET_WORKQUEUE_SUCCESS
  payload: string
}

interface IGetWorkqueueOfCurrentUserFailedAction {
  type: typeof GET_WORKQUEUE_FAILED
}

interface UpdateRegistrarWorkQueueSuccessAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE_SUCCESS
  payload: string
}

interface UpdateRegistrarWorkQueueFailAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE_FAIL
}

interface IDownloadDeclaration {
  type: typeof ENQUEUE_DOWNLOAD_DECLARATION
  payload: {
    declaration: IDeclaration
    client: ApolloClient<{}>
  }
}

interface IDownloadDeclarationSuccess {
  type: typeof DOWNLOAD_DECLARATION_SUCCESS
  payload: {
    queryData: any
    form: {
      [key in Event]: IForm
    }
    client: ApolloClient<{}>
    offlineData?: IOfflineData
    userDetails?: IUserDetails
  }
}

interface IDownloadDeclarationFail {
  type: typeof DOWNLOAD_DECLARATION_FAIL
  payload: {
    error: ApolloError
    declaration: IDeclaration
    client: ApolloClient<{}>
  }
}

interface UpdateRegistrarWorkqueueAction {
  type: typeof UPDATE_REGISTRAR_WORKQUEUE
  payload: {
    pageSize: number

    inProgressSkip: number
    healthSystemSkip: number
    reviewSkip: number
    rejectSkip: number
    approvalSkip: number
    externalValidationSkip: number
    printSkip: number
  }
}

export type Action =
  | IArchiveDeclarationAction
  | IStoreDeclarationAction
  | IModifyDeclarationAction
  | IClearCorrectionChange
  | ISetInitialDeclarationsAction
  | IWriteDeclarationAction
  | NavigationAction
  | IDeleteDeclarationAction
  | IReinstateDeclarationAction
  | IGetStorageDeclarationsSuccessAction
  | IGetStorageDeclarationsFailedAction
  | IGetWorkqueueOfCurrentUserSuccessAction
  | IGetWorkqueueOfCurrentUserFailedAction
  | IDownloadDeclaration
  | IDownloadDeclarationSuccess
  | IDownloadDeclarationFail
  | UserDetailsAvailable
  | UpdateRegistrarWorkqueueAction
  | UpdateRegistrarWorkQueueSuccessAction
  | UpdateRegistrarWorkQueueFailAction
  | ShowDownloadDeclarationFailedToast

export interface IUserData {
  userID: string
  userPIN?: string
  declarations: IDeclaration[]
  workqueue?: IWorkqueue
}

export interface IDeclarationsState {
  userID: string
  declarations: IDeclaration[]
  initialDeclarationsLoaded: boolean
  isWritingDraft: boolean
}

export interface WorkqueueState {
  workqueue: IWorkqueue
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
      approvalTab: { totalItems: 0, results: [] },
      printTab: { totalItems: 0, results: [] },
      externalValidationTab: { totalItems: 0, results: [] }
    },
    initialSyncDone: false
  }
}

const initialState: IDeclarationsState = {
  userID: '',
  declarations: [],
  initialDeclarationsLoaded: false,
  isWritingDraft: false
}

export function createDeclaration(event: Event, initialData?: IFormData) {
  return {
    id: uuid(),
    data: initialData || {},
    event,
    submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
  }
}

export function makeDeclarationReadyToDownload(
  event: Event,
  compositionId: string,
  action: string
): IDeclaration {
  return {
    id: compositionId,
    data: {},
    event,
    compositionId,
    action,
    downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
  }
}

export function createReviewDeclaration(
  declarationId: string,
  formData: IFormData,
  event: Event,
  status?: string,
  duplicates?: string[]
): IDeclaration {
  return {
    id: declarationId,
    data: formData,
    duplicates,
    originalData: formData,
    review: true,
    event,
    registrationStatus: status
  }
}

export function dynamicDispatch(
  action: string,
  payload: { [key: string]: string }
) {
  return {
    type: action,
    payload
  }
}

export function storeDeclaration(
  declaration: IDeclaration
): IStoreDeclarationAction {
  declaration.savedOn = Date.now()
  return { type: STORE_DECLARATION, payload: { declaration } }
}

export function modifyDeclaration(
  declaration: IDeclaration | IPrintableDeclaration
): IModifyDeclarationAction {
  declaration.modifiedOn = Date.now()
  return { type: MODIFY_DECLARATION, payload: { declaration } }
}

export function clearCorrectionChange(
  declarationId: string
): IClearCorrectionChange {
  return { type: CLEAR_CORRECTION_CHANGE, payload: { declarationId } }
}
export function setInitialDeclarations() {
  return { type: SET_INITIAL_DECLARATION }
}

export const getStorageDeclarationsSuccess = (
  response: string
): IGetStorageDeclarationsSuccessAction => ({
  type: GET_DECLARATIONS_SUCCESS,
  payload: response
})

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

export const getStorageDeclarationsFailed =
  (): IGetStorageDeclarationsFailedAction => ({
    type: GET_DECLARATIONS_FAILED
  })

export function archiveDeclaration(
  declarationId: string
): IArchiveDeclarationAction {
  return { type: ARCHIVE_DECLARATION, payload: { declarationId } }
}

export function reinstateDeclaration(
  declarationId: string
): IReinstateDeclarationAction {
  return { type: REINSTATE_DECLARATION, payload: { declarationId } }
}

export function deleteDeclaration(
  declaration: IDeclaration | IPrintableDeclaration,
  options?: OnSuccessDeleteDeclarationOptions
): IDeleteDeclarationAction {
  return { type: DELETE_DECLARATION, payload: { declaration, ...options } }
}

export function writeDeclaration(
  declaration: IDeclaration | IPrintableDeclaration,
  callback?: () => void
): IWriteDeclarationAction {
  return { type: WRITE_DECLARATION, payload: { declaration, callback } }
}

export async function getCurrentUserID(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')

  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as IUserDetails).userMgntUserID || ''
}

async function getUserData(userId: string) {
  const userData = await storage.getItem('USER_DATA')
  const allUserData: IUserData[] = !userData
    ? []
    : (JSON.parse(userData) as IUserData[])
  const currentUserData = allUserData.find((uData) => uData.userID === userId)

  return { allUserData, currentUserData }
}

async function getFieldAgentDeclaredDeclarations(userDetails: IUserDetails) {
  const userId = userDetails.practitionerId
  const locationIds = (userDetails && [getUserLocation(userDetails).id]) || []

  let result
  try {
    const response = await client.query({
      query: SEARCH_DECLARATIONS_USER_WISE,
      variables: {
        userId,
        status: [EVENT_STATUS.DECLARED],
        locationIds,
        count: DECLARED_DECLARATION_SEARCH_QUERY_COUNT,
        sort: Sort.ASC
      },
      fetchPolicy: 'no-cache'
    })
    result = response.data && response.data.searchEvents
  } catch (exception) {
    result = undefined
  }
  return result
}

async function getFieldAgentRejectedDeclarations(userDetails: IUserDetails) {
  const userId = userDetails.practitionerId
  const locationIds = (userDetails && [getUserLocation(userDetails).id]) || []

  let result
  try {
    const response = await client.query({
      query: SEARCH_DECLARATIONS_USER_WISE,
      variables: {
        userId,
        status: [EVENT_STATUS.REJECTED],
        locationIds
      },
      fetchPolicy: 'no-cache'
    })
    result = response.data && response.data.searchEvents
  } catch (exception) {
    result = undefined
  }
  return result
}

export function mergeDeclaredDeclarations(
  declarations: IDeclaration[],
  declaredDeclarations: GQLEventSearchSet[]
) {
  const localDeclarations = declarations.map(
    (declaration) => declaration.compositionId
  )

  const declarationsNotStoredLocally = declaredDeclarations.filter(
    (declaredDeclaration) => !localDeclarations.includes(declaredDeclaration.id)
  )
  const transformedDeclaredDeclarations = declarationsNotStoredLocally.map(
    (app) => {
      return transformSearchQueryDataToDraft(app)
    }
  )
  declarations.push(...transformedDeclaredDeclarations)
}

export async function getWorkqueueOfCurrentUser(): Promise<string> {
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

export async function getDeclarationsOfCurrentUser(): Promise<string> {
  // returns a 'stringified' IUserData
  const storageTable = await storage.getItem('USER_DATA')
  if (!storageTable) {
    return JSON.stringify({ declarations: [] })
  }

  const currentUserID = await getCurrentUserID()

  const allUserData = JSON.parse(storageTable) as IUserData[]

  if (!allUserData.length) {
    // No user-data at all
    const payloadWithoutDeclarations: IUserData = {
      userID: currentUserID,
      declarations: []
    }

    return JSON.stringify(payloadWithoutDeclarations)
  }

  const currentUserData = allUserData.find(
    (uData) => uData.userID === currentUserID
  )
  const currentUserDeclarations: IDeclaration[] =
    (currentUserData && currentUserData.declarations) || []
  const payload: IUserData = {
    userID: currentUserID,
    declarations: currentUserDeclarations
  }
  return JSON.stringify(payload)
}

async function updateWorkqueueData(
  state: IStoreState,
  declaration: IDeclaration,
  workQueueId: keyof IQueryData,
  userWorkqueue?: IWorkqueue
) {
  if (!userWorkqueue || !userWorkqueue.data) {
    return
  }

  const workqueueApp =
    userWorkqueue.data[workQueueId] &&
    userWorkqueue.data[workQueueId].results &&
    // @ts-ignore
    userWorkqueue.data[workQueueId].results.find(
      (app) => app && app.id === declaration.id
    )
  if (!workqueueApp) {
    return
  }
  const sectionId = declaration.event === 'birth' ? 'child' : 'deceased'
  const sectionDefinition = getRegisterForm(state)[
    declaration.event
  ].sections.find((section) => section.id === sectionId)

  const transformedDeclaration = draftToGqlTransformer(
    // transforming required section only
    { sections: sectionDefinition ? [sectionDefinition] : [] },
    declaration.data
  )
  const transformedName =
    (transformedDeclaration &&
      transformedDeclaration[sectionId] &&
      transformedDeclaration[sectionId].name) ||
    []
  const transformedDeathDate =
    (declaration.data &&
      declaration.data.deathEvent &&
      declaration.data.deathEvent.deathDate) ||
    []
  const transformedBirthDate =
    (declaration.data &&
      declaration.data.child &&
      declaration.data.child.childBirthDate) ||
    []
  const transformedInformantContactNumber =
    (declaration.data &&
      declaration.data.registration &&
      declaration.data.registration.contactPoint &&
      (declaration.data.registration.contactPoint as IContactPoint).nestedFields
        .registrationPhone) ||
    ''
  if (declaration.event === 'birth') {
    ;(workqueueApp as GQLBirthEventSearchSet).childName = transformedName
    ;(workqueueApp as GQLBirthEventSearchSet).dateOfBirth = transformedBirthDate
    ;(
      (workqueueApp as GQLDeathEventSearchSet)
        .registration as GQLRegistrationSearchSet
    ).contactNumber = transformedInformantContactNumber
  } else {
    ;(workqueueApp as GQLDeathEventSearchSet).deceasedName = transformedName
    ;(workqueueApp as GQLDeathEventSearchSet).dateOfDeath = transformedDeathDate
    ;(
      (workqueueApp as GQLDeathEventSearchSet)
        .registration as GQLRegistrationSearchSet
    ).contactNumber = transformedInformantContactNumber
  }
}

export async function writeDeclarationByUser(
  getState: () => IStoreState,
  userId: string,
  declaration: IDeclaration
): Promise<string> {
  const uID = userId || (await getCurrentUserID())
  const userData = await getUserData(uID)
  const { allUserData } = userData
  let { currentUserData } = userData

  const existingDeclarationId = currentUserData
    ? currentUserData.declarations.findIndex((app) => app.id === declaration.id)
    : -1

  if (existingDeclarationId >= 0) {
    currentUserData &&
      currentUserData.declarations.splice(existingDeclarationId, 1)
  }

  if (currentUserData) {
    currentUserData.declarations.push(declaration)
  } else {
    currentUserData = {
      userID: uID,
      declarations: [declaration]
    }
    allUserData.push(currentUserData)
  }
  if (
    declaration.registrationStatus &&
    declaration.registrationStatus === 'IN_PROGRESS'
  ) {
    updateWorkqueueData(
      getState(),
      declaration,
      'inProgressTab',
      currentUserData.workqueue
    )
    updateWorkqueueData(
      getState(),
      declaration,
      'notificationTab',
      currentUserData.workqueue
    )
  }

  if (
    declaration.registrationStatus &&
    declaration.registrationStatus === 'DECLARED'
  ) {
    updateWorkqueueData(
      getState(),
      declaration,
      'reviewTab',
      currentUserData.workqueue
    )
  }

  if (
    declaration.registrationStatus &&
    declaration.registrationStatus === 'VALIDATED'
  ) {
    updateWorkqueueData(
      getState(),
      declaration,
      'reviewTab',
      currentUserData.workqueue
    )
  }

  if (
    declaration.registrationStatus &&
    declaration.registrationStatus === 'REJECTED'
  ) {
    updateWorkqueueData(
      getState(),
      declaration,
      'rejectTab',
      currentUserData.workqueue
    )
  }

  return Promise.all([
    storage.setItem('USER_DATA', JSON.stringify(allUserData)),
    JSON.stringify(currentUserData)
  ]).then(([_, currentUserData]) => currentUserData)
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
    ;(
      destinationWorkQueue.data[workQueueId].results as GQLEventSearchSet[]
    ).forEach((declaration) => {
      if (declaration == null) {
        return
      }
      const declarationIndex = currentApplications.findIndex(
        (app) => app && app.id === declaration.id
      )
      if (declarationIndex >= 0) {
        const isDownloadFailed =
          currentApplications[declarationIndex].downloadStatus ===
            SUBMISSION_STATUS.FAILED_NETWORK ||
          currentApplications[declarationIndex].downloadStatus ===
            SUBMISSION_STATUS.FAILED

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
  userDetails: IUserDetails,
  workqueuePaginationParams: IWorkqueuePaginationParams,
  currentWorkqueue: IWorkqueue | undefined
) {
  const registrationLocationId =
    (userDetails && getUserLocation(userDetails).id) || ''

  const scope = getScope(state)
  const reviewStatuses =
    scope && scope.includes('register')
      ? [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED]
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
    printSkip
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
    userId
  )
  let workqueue
  if (result) {
    workqueue = {
      loading: false,
      error: false,
      data: result,
      initialSyncDone: true
    }
  } else {
    workqueue = {
      loading: false,
      error: true,
      data:
        (currentWorkqueue && currentWorkqueue.data) ||
        (state.workqueueState && state.workqueueState.workqueue.data),
      initialSyncDone: false
    }
  }
  const { currentUserData } = await getUserData(
    userDetails.userMgntUserID || ''
  )
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

export async function writeRegistrarWorkqueueByUser(
  getState: () => IStoreState,
  workqueuePaginationParams: IWorkqueuePaginationParams
): Promise<string> {
  const state = getState()
  const userDetails = getUserDetails(state) as IUserDetails

  const uID = userDetails.userMgntUserID || ''
  const userData = await getUserData(uID)
  const { allUserData } = userData
  let { currentUserData } = userData

  const workqueue = await getWorkqueueData(
    state,
    userDetails,
    workqueuePaginationParams,
    currentUserData && currentUserData.workqueue
  )
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

export async function deleteDeclarationByUser(
  userId: string,
  declaration: IDeclaration
): Promise<string> {
  const uID = userId || (await getCurrentUserID())
  const { allUserData, currentUserData } = await getUserData(uID)

  const deletedDeclarationId = currentUserData
    ? currentUserData.declarations.findIndex((app) => app.id === declaration.id)
    : -1

  if (deletedDeclarationId >= 0) {
    currentUserData &&
      currentUserData.declarations.splice(deletedDeclarationId, 1)
    storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }

  return JSON.stringify(currentUserData)
}

export function downloadDeclaration(
  declaration: IDeclaration,
  client: ApolloClient<{}>
): IDownloadDeclaration {
  return {
    type: ENQUEUE_DOWNLOAD_DECLARATION,
    payload: {
      declaration,
      client
    }
  }
}

export function updateRegistrarWorkqueue(
  userId?: string,
  pageSize = 10,
  isFieldAgent = false,
  inProgressSkip = 0,
  healthSystemSkip = 0,
  reviewSkip = 0,
  rejectSkip = 0,
  approvalSkip = 0,
  externalValidationSkip = 0,
  printSkip = 0
) {
  return {
    type: UPDATE_REGISTRAR_WORKQUEUE,
    payload: {
      userId,
      pageSize,
      isFieldAgent,
      inProgressSkip,
      healthSystemSkip,
      reviewSkip,
      rejectSkip,
      approvalSkip,
      externalValidationSkip,
      printSkip
    }
  }
}

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

function createRequestForDeclaration(
  declaration: IDeclaration,
  client: ApolloClient<{}>
) {
  const declarationAction = ACTION_LIST[declaration.action as string] || null
  const result = getQueryMapping(
    declaration.event,
    declarationAction as DeclarationAction
  )
  const { query } = result || {
    query: null
  }

  return {
    request: client.query,
    requestArgs: {
      query,
      variables: { id: declaration.id }
    }
  }
}

function requestWithStateWrapper(
  mainRequest: Promise<ApolloQueryResult<any>>,
  getState: () => IStoreState,
  client: ApolloClient<{}>
) {
  const store = getState()
  return new Promise(async (resolve, reject) => {
    try {
      const data = await mainRequest
      resolve({ data, store, client })
    } catch (error) {
      reject(error)
    }
  })
}

function getDataKey(declaration: IDeclaration) {
  const result = getQueryMapping(
    declaration.event,
    declaration.action as DeclarationAction
  )

  const { dataKey } = result || { dataKey: null }
  return dataKey
}

function downloadDeclarationSuccess({
  data,
  store,
  client
}: {
  data: any
  store: IStoreState
  client: ApolloClient<{}>
}): IDownloadDeclarationSuccess {
  const form = getRegisterForm(store)

  return {
    type: DOWNLOAD_DECLARATION_SUCCESS,
    payload: {
      queryData: data,
      form,
      client,
      offlineData: getOfflineData(store),
      userDetails: getUserDetails(store) as IUserDetails
    }
  }
}

function downloadDeclarationFail(
  error: ApolloError,
  declaration: IDeclaration,
  client: ApolloClient<{}>
): IDownloadDeclarationFail {
  return {
    type: DOWNLOAD_DECLARATION_FAIL,
    payload: {
      error,
      declaration,
      client
    }
  }
}

export const declarationsReducer: LoopReducer<IDeclarationsState, Action> = (
  state: IDeclarationsState = initialState,
  action: Action
): IDeclarationsState | Loop<IDeclarationsState, Action> => {
  switch (action.type) {
    case GO_TO_PAGE: {
      const declaration = state.declarations.find(
        ({ id }) => id === action.payload.declarationId
      )

      if (!declaration || declaration.data[action.payload.pageId]) {
        return state
      }
      const modifiedDeclaration = {
        ...declaration,
        data: {
          ...declaration.data,
          [action.payload.pageId]: {}
        }
      }
      return loop(state, Cmd.action(modifyDeclaration(modifiedDeclaration)))
    }
    case REINSTATE_DECLARATION: {
      if (action.payload) {
        const declaration = state.declarations.find(
          ({ id }) => id === action.payload.declarationId
        )

        if (!declaration) {
          return state
        }
        const modifiedDeclaration: IDeclaration = {
          ...declaration,
          submissionStatus: SUBMISSION_STATUS.READY_TO_REINSTATE,
          action: DeclarationAction.REINSTATE_DECLARATION,
          payload: { id: declaration.id }
        }
        return loop(state, Cmd.action(writeDeclaration(modifiedDeclaration)))
      }
      return state
    }
    case STORE_DECLARATION:
      return {
        ...state,
        declarations: state.declarations
          ? state.declarations.concat(action.payload.declaration)
          : [action.payload.declaration]
      }
    case DELETE_DECLARATION:
      return loop(
        {
          ...state
        },
        Cmd.run(deleteDeclarationByUser, {
          successActionCreator: getStorageDeclarationsSuccess,
          failActionCreator: getStorageDeclarationsFailed,
          args: [state.userID, action.payload.declaration]
        })
      )
    case MODIFY_DECLARATION:
      const newDeclarations: IDeclaration[] = state.declarations || []
      const currentDeclarationIndex = newDeclarations.findIndex(
        (declaration) => declaration.id === action.payload.declaration.id
      )
      const modifiedDeclaration = { ...action.payload.declaration }

      if (modifiedDeclaration.data?.informant?.relationship) {
        modifiedDeclaration.data.informant.relationship = (
          modifiedDeclaration.data.registration.informantType as FieldValueMap
        )?.value
      }

      newDeclarations[currentDeclarationIndex] = modifiedDeclaration

      return {
        ...state,
        declarations: newDeclarations
      }
    case CLEAR_CORRECTION_CHANGE: {
      const declarationIndex = state.declarations.findIndex(
        (declaration) => declaration.id === action.payload.declarationId
      )

      const correction = state.declarations[declarationIndex]

      const orignalAppliation: IDeclaration = {
        ...correction,
        data: {
          ...correction.originalData
        }
      }

      return loop(state, Cmd.action(writeDeclaration(orignalAppliation)))
    }

    case WRITE_DECLARATION:
      return loop(
        {
          ...state,
          isWritingDraft: true
        },
        Cmd.run(writeDeclarationByUser, {
          successActionCreator: (response: string) => {
            if (action.payload.callback) {
              action.payload.callback()
            }
            return getStorageDeclarationsSuccess(response)
          },
          failActionCreator: getStorageDeclarationsFailed,
          args: [Cmd.getState, state.userID, action.payload.declaration]
        })
      )
    case USER_DETAILS_AVAILABLE:
      return loop(
        {
          ...state
        },
        Cmd.run<
          IGetStorageDeclarationsFailedAction,
          IGetStorageDeclarationsSuccessAction
        >(getDeclarationsOfCurrentUser, {
          successActionCreator: getStorageDeclarationsSuccess,
          failActionCreator: getStorageDeclarationsFailed,
          args: []
        })
      )
    case GET_DECLARATIONS_SUCCESS:
      if (action.payload) {
        const userData = JSON.parse(action.payload) as IUserData
        return {
          ...state,
          userID: userData.userID,
          declarations: userData.declarations,
          initialDeclarationsLoaded: true,
          isWritingDraft: false
        }
      }
      return {
        ...state,
        initialDeclarationsLoaded: true
      }
    case ENQUEUE_DOWNLOAD_DECLARATION:
      const { declarations } = state
      const { declaration, client } = action.payload
      const downloadIsRunning = declarations.some(
        (declaration) =>
          declaration.downloadStatus === DOWNLOAD_STATUS.DOWNLOADING
      )

      const declarationIndex = declarations.findIndex(
        (app) => declaration.id === app.id
      )
      let newDeclarationsAfterStartingDownload = Array.from(declarations)

      // Download is running, so enqueue
      if (downloadIsRunning) {
        // Declaration is not in list
        if (declarationIndex === -1) {
          newDeclarationsAfterStartingDownload = declarations.concat([
            declaration
          ])
        } else {
          // Declaration is failed before, just make it ready to download
          newDeclarationsAfterStartingDownload[declarationIndex] = declaration
        }

        // Download is running just return the state
        return {
          ...state,
          declarations: newDeclarationsAfterStartingDownload
        }
      }
      // Download is not running
      else {
        // Declaration is not in list, so push it
        if (declarationIndex === -1) {
          newDeclarationsAfterStartingDownload = declarations.concat([
            {
              ...declaration,
              downloadStatus: DOWNLOAD_STATUS.DOWNLOADING
            }
          ])
        }
        // Declaration is in list make it downloading
        else {
          newDeclarationsAfterStartingDownload[declarationIndex] = {
            ...declaration,
            downloadStatus: DOWNLOAD_STATUS.DOWNLOADING
          }
        }
      }

      const newState = {
        ...state,
        declarations: newDeclarationsAfterStartingDownload
      }

      const { request, requestArgs } = createRequestForDeclaration(
        declaration,
        client
      ) as any

      return loop(
        newState,
        Cmd.run<IDownloadDeclarationFail, IDownloadDeclarationSuccess>(
          requestWithStateWrapper,
          {
            args: [
              request({ ...requestArgs, fetchPolicy: 'no-cache' }),
              Cmd.getState,
              client
            ],
            successActionCreator: downloadDeclarationSuccess,
            failActionCreator: (err) =>
              downloadDeclarationFail(
                err,
                {
                  ...declaration,
                  downloadStatus: DOWNLOAD_STATUS.DOWNLOADING
                },
                client
              )
          }
        )
      )
    case DOWNLOAD_DECLARATION_SUCCESS:
      const {
        queryData,
        form,
        client: clientFromSuccess,
        offlineData,
        userDetails
      } = action.payload

      const downloadingDeclarationIndex = state.declarations.findIndex(
        (declaration) =>
          declaration.downloadStatus === DOWNLOAD_STATUS.DOWNLOADING
      )
      const newDeclarationsAfterDownload = Array.from(state.declarations)
      const downloadingDeclaration =
        newDeclarationsAfterDownload[downloadingDeclarationIndex]

      const dataKey = getDataKey(downloadingDeclaration)
      const eventData = queryData.data[dataKey as string]
      const transData: IFormData = gqlToDraftTransformer(
        form[downloadingDeclaration.event],
        eventData,
        offlineData,
        userDetails
      )
      const downloadedAppStatus: string =
        (eventData &&
          eventData.registration &&
          eventData.registration.status &&
          eventData.registration.status[0].type) ||
        ''
      newDeclarationsAfterDownload[downloadingDeclarationIndex] =
        createReviewDeclaration(
          downloadingDeclaration.id,
          transData,
          downloadingDeclaration.event,
          downloadedAppStatus,
          getPotentialDuplicateIds(eventData)
        )
      newDeclarationsAfterDownload[downloadingDeclarationIndex].downloadStatus =
        DOWNLOAD_STATUS.DOWNLOADED

      const newStateAfterDownload = {
        ...state,
        declarations: newDeclarationsAfterDownload
      }

      // Check if there is more to download
      const downloadQueueInprogress = state.declarations.filter(
        (declaration) =>
          declaration.downloadStatus === DOWNLOAD_STATUS.READY_TO_DOWNLOAD
      )

      // If not then, write to IndexedDB and return state
      if (!downloadQueueInprogress.length) {
        return loop(
          newStateAfterDownload,
          Cmd.run(writeDeclarationByUser, {
            args: [
              Cmd.getState,
              state.userID,
              newDeclarationsAfterDownload[downloadingDeclarationIndex]
            ],
            failActionCreator: (err) =>
              downloadDeclarationFail(
                err,
                newDeclarationsAfterDownload[downloadingDeclarationIndex],
                clientFromSuccess
              )
          })
        )
      }

      const declarationToDownload = downloadQueueInprogress[0]
      declarationToDownload.downloadStatus = DOWNLOAD_STATUS.DOWNLOADING
      const { request: nextRequest, requestArgs: nextRequestArgs } =
        createRequestForDeclaration(
          declarationToDownload,
          clientFromSuccess
        ) as any

      // Return state, write to indexedDB and download the next ready to download declaration, all in sequence
      return loop(
        newStateAfterDownload,
        Cmd.list(
          [
            Cmd.run(writeDeclarationByUser, {
              args: [
                Cmd.getState,
                state.userID,
                newDeclarationsAfterDownload[downloadingDeclarationIndex]
              ],
              failActionCreator: downloadDeclarationFail
            }),
            Cmd.run<IDownloadDeclarationFail, IDownloadDeclarationSuccess>(
              requestWithStateWrapper,
              {
                args: [
                  nextRequest({ ...nextRequestArgs, fetchPolicy: 'no-cache' }),
                  Cmd.getState,
                  clientFromSuccess
                ],
                successActionCreator: downloadDeclarationSuccess,
                failActionCreator: (err) =>
                  downloadDeclarationFail(
                    err,
                    newDeclarationsAfterDownload[downloadingDeclarationIndex],
                    clientFromSuccess
                  )
              }
            )
          ],
          { sequence: true }
        )
      )

    case DOWNLOAD_DECLARATION_FAIL:
      const {
        declaration: erroredDeclaration,
        error,
        client: clientFromFail
      } = action.payload
      erroredDeclaration.downloadRetryAttempt =
        (erroredDeclaration.downloadRetryAttempt || 0) + 1

      const { request: retryRequest, requestArgs: retryRequestArgs } =
        createRequestForDeclaration(erroredDeclaration, clientFromFail) as any

      const declarationsAfterError = Array.from(state.declarations)
      const erroredDeclarationIndex = declarationsAfterError.findIndex(
        (declaration) =>
          declaration.downloadStatus === DOWNLOAD_STATUS.DOWNLOADING
      )

      declarationsAfterError[erroredDeclarationIndex] = erroredDeclaration

      // Retry download until limit reached
      if (
        erroredDeclaration.downloadRetryAttempt < DOWNLOAD_MAX_RETRY_ATTEMPT
      ) {
        return loop(
          {
            ...state,
            declarations: declarationsAfterError
          },
          Cmd.run<IDownloadDeclarationFail, IDownloadDeclarationSuccess>(
            requestWithStateWrapper,
            {
              args: [
                retryRequest({ ...retryRequestArgs, fetchPolicy: 'no-cache' }),
                Cmd.getState,
                clientFromFail
              ],
              successActionCreator: downloadDeclarationSuccess,
              failActionCreator: (err) =>
                downloadDeclarationFail(err, erroredDeclaration, clientFromFail)
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

      erroredDeclaration.downloadStatus = status

      declarationsAfterError[erroredDeclarationIndex] = erroredDeclaration

      const downloadQueueFollowing = state.declarations.filter(
        (declaration) =>
          declaration.downloadStatus === DOWNLOAD_STATUS.READY_TO_DOWNLOAD
      )

      // If nothing more to download, return the state and write the declarations
      if (!downloadQueueFollowing.length) {
        return loop(
          {
            ...state,
            declarations: declarationsAfterError
          },
          Cmd.list([
            Cmd.action(showDownloadDeclarationFailedToast()),
            Cmd.run(writeDeclarationByUser, {
              args: [Cmd.getState, state.userID, erroredDeclaration]
            })
          ])
        )
      }

      // If there are more to download in queue, start the next request
      const nextDeclaration = downloadQueueFollowing[0]
      const {
        request: nextDeclarationRequest,
        requestArgs: nextDeclarationRequestArgs
      } = createRequestForDeclaration(nextDeclaration, clientFromFail) as any
      return loop(
        {
          ...state,
          declarations: declarationsAfterError
        },
        Cmd.list(
          [
            Cmd.run(writeDeclarationByUser, {
              args: [Cmd.getState, state.userID, erroredDeclaration]
            }),
            Cmd.run(requestWithStateWrapper, {
              args: [
                nextDeclarationRequest({
                  ...nextDeclarationRequestArgs,
                  fetchPolicy: 'no-cache'
                }),
                Cmd.getState,
                clientFromFail
              ],
              successActionCreator: downloadDeclarationSuccess,
              failActionCreator: (err) =>
                downloadDeclarationFail(err, nextDeclaration, clientFromFail)
            })
          ],
          { sequence: true }
        )
      )

    case ARCHIVE_DECLARATION:
      if (action.payload) {
        const declaration = state.declarations.find(
          ({ id }) => id === action.payload.declarationId
        )

        if (!declaration) {
          return state
        }
        const modifiedDeclaration: IDeclaration = {
          ...declaration,
          submissionStatus: SUBMISSION_STATUS.READY_TO_ARCHIVE,
          action: DeclarationAction.ARCHIVE_DECLARATION,
          payload: { id: declaration.id }
        }
        return loop(state, Cmd.action(writeDeclaration(modifiedDeclaration)))
      }
      return state

    default:
      return state
  }
}

export const registrarWorkqueueReducer: LoopReducer<WorkqueueState, Action> = (
  state: WorkqueueState = workqueueInitialState,
  action: Action
): WorkqueueState | Loop<WorkqueueState, Action> => {
  switch (action.type) {
    case UPDATE_REGISTRAR_WORKQUEUE:
      return loop(
        {
          workqueue: {
            ...state.workqueue,
            loading: true
          }
        },
        Cmd.run(writeRegistrarWorkqueueByUser, {
          successActionCreator: updateRegistrarWorkqueueSuccessActionCreator,
          failActionCreator: updateRegistrarWorkqueueFailActionCreator,
          args: [Cmd.getState, action.payload]
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
          workqueue
        }
      }
      return state

    case UPDATE_REGISTRAR_WORKQUEUE_SUCCESS:
      if (action.payload) {
        const workqueue = JSON.parse(action.payload) as IWorkqueue

        return {
          workqueue
        }
      }
      return state

    default:
      return state
  }
}

export function filterProcessingDeclarations(
  data: GQLEventSearchResultSet,
  processingDeclarationIds: string[]
): GQLEventSearchResultSet {
  if (!data?.results) {
    return data
  }

  const filteredResults = data.results.filter((result) => {
    if (result === null) {
      return false
    }

    return !processingDeclarationIds.includes(result.id)
  })
  const filteredTotal =
    (data.totalItems || 0) - (data.results.length - filteredResults.length)

  return {
    results: filteredResults,
    totalItems: filteredTotal
  }
}

export function filterProcessingDeclarationsFromQuery(
  queryData: IQueryData,
  storedDeclarations: IDeclaration[]
): IQueryData {
  const processingDeclarationIds = storedDeclarations
    .filter(
      (declaration) =>
        declaration.submissionStatus &&
        processingStates.includes(
          declaration.submissionStatus as SUBMISSION_STATUS
        )
    )
    .map((declaration) => declaration.id)

  return {
    inProgressTab: filterProcessingDeclarations(
      queryData.inProgressTab,
      processingDeclarationIds
    ),
    notificationTab: filterProcessingDeclarations(
      queryData.notificationTab,
      processingDeclarationIds
    ),
    reviewTab: filterProcessingDeclarations(
      queryData.reviewTab,
      processingDeclarationIds
    ),
    rejectTab: filterProcessingDeclarations(
      queryData.rejectTab,
      processingDeclarationIds
    ),
    approvalTab: filterProcessingDeclarations(
      queryData.approvalTab,
      processingDeclarationIds
    ),
    printTab: filterProcessingDeclarations(
      queryData.printTab,
      processingDeclarationIds
    ),
    externalValidationTab: filterProcessingDeclarations(
      queryData.externalValidationTab,
      processingDeclarationIds
    )
  }
}
