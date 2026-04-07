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
  ApolloClient,
  ApolloError,
  InternalRefetchQueriesInclude
} from '@apollo/client'
import {
  Action as DeclarationAction,
  IForm,
  IFormData,
  IFormFieldValue
} from '@client/forms'

import {
  ShowDownloadDeclarationFailedToast,
  ShowUnassignedDeclarations
} from '@client/notification/actions'
import { IOfflineData } from '@client/offline/reducer'
import {
  UserDetailsAvailable
} from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  AssignmentData,
  EventType,
  RegStatus
} from '@client/utils/gateway'
import type {
  GQLEventSearchResultSet
} from '@client/utils/gateway-deprecated-do-not-use'
import { UserDetails } from '@client/utils/userUtils'
import {
  IQueryData,
  IWorkqueue,
  UpdateRegistrarWorkqueueAction
} from '@client/workqueue'
import { LoopReducer } from 'redux-loop'
import { v4 as uuid } from 'uuid'

const ARCHIVE_DECLARATION = 'DECLARATION/ARCHIVE'
const SET_INITIAL_DECLARATION = 'DECLARATION/SET_INITIAL_DECLARATION'
const STORE_DECLARATION = 'DECLARATION/STORE_DECLARATION'
const MODIFY_DECLARATION = 'DECLARATION/MODIFY_DRAFT'
const WRITE_DECLARATION = 'DECLARATION/WRITE_DRAFT'
const WRITE_DECLARATION_SUCCESS = 'DECLARATION/WRITE_DRAFT_SUCCESS'
const WRITE_DECLARATION_FAILED = 'DECLARATION/WRITE_DRAFT_FAILED'
const DELETE_DECLARATION = 'DECLARATION/DELETE_DRAFT'
const DELETE_DECLARATION_SUCCESS = 'DECLARATION/DELETE_DRAFT_SUCCESS'
const DELETE_DECLARATION_FAILED = 'DECLARATION/DELETE_DRAFT_FAILED'
const GET_DECLARATIONS_SUCCESS = 'DECLARATION/GET_DRAFTS_SUCCESS'
const GET_DECLARATIONS_FAILED = 'DECLARATION/GET_DRAFTS_FAILED'
const ENQUEUE_DOWNLOAD_DECLARATION = 'DECLARATION/ENQUEUE_DOWNLOAD_DECLARATION'
const DOWNLOAD_DECLARATION_SUCCESS = 'DECLARATION/DOWNLOAD_DECLARATION_SUCCESS'
const DOWNLOAD_DECLARATION_FAIL = 'DECLARATION/DOWNLOAD_DECLARATION_FAIL'
const CLEAR_CORRECTION_AND_PRINT_CHANGES = 'CLEAR_CORRECTION_AND_PRINT_CHANGES'
const ENQUEUE_UNASSIGN_DECLARATION = 'DECLARATION/ENQUEUE_UNASSIGN'
const UNASSIGN_DECLARATION = 'DECLARATION/UNASSIGN'
const UNASSIGN_DECLARATION_SUCCESS = 'DECLARATION/UNASSIGN_SUCCESS'
const UNASSIGN_DECLARATION_FAILED = 'DECLARATION/UNASSIGN_FAILED'
const REMOVE_UNASSIGNED_DECLARATIONS =
  'DECLARATION/REMOVE_UNASSIGNED_DECLARATIONS'

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
  READY_TO_ISSUE = 'READY_TO_ISSUE',
  ISSUING = 'ISSUING',
  ISSUED = 'ISSUED',
  READY_TO_REQUEST_CORRECTION = 'READY_TO_REQUEST_CORRECTION',
  REQUESTING_CORRECTION = 'REQUESTING_CORRECTION',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK',
  IN_PROGRESS = 'IN_PROGRESS',
  CORRECTION_REQUESTED = 'CORRECTION_REQUESTED',
  REJECT_CORRECTION = 'REJECT_CORRECTION'
}

enum DOWNLOAD_STATUS {
  READY_TO_DOWNLOAD = 'READY_TO_DOWNLOAD',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK',
  READY_TO_UNASSIGN = 'READY_TO_UNASSIGN',
  UNASSIGNING = 'UNASSIGNING'
}

const processingStates = [
  SUBMISSION_STATUS.READY_TO_ARCHIVE,
  SUBMISSION_STATUS.ARCHIVING,
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
  SUBMISSION_STATUS.REQUESTING_CORRECTION,
  SUBMISSION_STATUS.CORRECTION_REQUESTED,
  SUBMISSION_STATUS.READY_TO_ISSUE,
  SUBMISSION_STATUS.ISSUING,
  SUBMISSION_STATUS.REJECT_CORRECTION
]

export interface IPayload {
  [key: string]: IFormFieldValue
}

interface IVisitedGroupId {
  sectionId: string
  groupId: string
}

interface ITaskHistory {
  operationType?: string
  operatedOn?: string
}

export interface IDuplicates {
  compositionId: string
  trackingId: string
}

export interface IDeclaration {
  id: string
  data: IFormData
  duplicates?: IDuplicates[]
  originalData?: IFormData
  localData?: IFormData
  savedOn?: number
  createdAt?: string
  modifiedOn?: number
  eventType?: string
  review?: boolean
  event: EventType
  registrationStatus?: RegStatus
  submissionStatus?: string
  downloadStatus?: DOWNLOAD_STATUS
  downloadRetryAttempt?: number
  action?: DeclarationAction
  trackingId?: string
  registrationNumber?: string
  payload?: IPayload
  visitedGroupIds?: IVisitedGroupId[]
  timeLoggedMS?: number
  writingDraft?: boolean
  operationHistories?: ITaskHistory[]
  isNotDuplicate?: boolean
  assignmentStatus?: AssignmentData
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
  collector?: Partial<{
    type: Relation | string
    certificateTemplateId: string
  }>
  corrector?: Partial<{ type: RelationForCertificateCorrection | string }>
  hasShowedVerifiedDocument?: boolean
  payments?: Payment
  certificateTemplateId?: string
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
      informantType: Relation | string
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
  amount: number
  outcome: PaymentOutcomeType
  date: string
}

interface IArchiveDeclarationAction {
  type: typeof ARCHIVE_DECLARATION
  payload: {
    declarationId: string
    reason?: string
    comment?: string
    duplicateTrackingId?: string
  }
}

interface IStoreDeclarationAction {
  type: typeof STORE_DECLARATION
  payload: { declaration: IDeclaration }
}

interface IModifyDeclarationAction {
  type: typeof MODIFY_DECLARATION
  payload: {
    declaration: IPrintableDeclaration | Partial<IDeclaration>
  }
}

interface IClearCorrectionAndPrintChanges {
  type: typeof CLEAR_CORRECTION_AND_PRINT_CHANGES
  payload: {
    declarationId: string
  }
}
interface IWriteDeclarationAction {
  type: typeof WRITE_DECLARATION
  payload: {
    declaration: IDeclaration | IPrintableDeclaration
    callback?: () => void
  }
}

interface IWriteDeclarationSuccessAction {
  type: typeof WRITE_DECLARATION_SUCCESS
  payload: {
    declaration: IDeclaration
  }
}

interface IWriteDeclarationFailedAction {
  type: typeof WRITE_DECLARATION_FAILED
}

interface ISetInitialDeclarationsAction {
  type: typeof SET_INITIAL_DECLARATION
}

interface IDeleteDeclarationAction {
  type: typeof DELETE_DECLARATION
  payload: {
    declarationId: string
    client: ApolloClient<{}>
  }
}

interface IGetStorageDeclarationsSuccessAction {
  type: typeof GET_DECLARATIONS_SUCCESS
  payload: string
}

interface IGetStorageDeclarationsFailedAction {
  type: typeof GET_DECLARATIONS_FAILED
}

interface IDeleteDeclarationSuccessAction {
  type: typeof DELETE_DECLARATION_SUCCESS
  payload: { declarationId: string; client: ApolloClient<{}> }
}

interface IDeleteDeclarationFailedAction {
  type: typeof DELETE_DECLARATION_FAILED
}

interface IDownloadDeclaration {
  type: typeof ENQUEUE_DOWNLOAD_DECLARATION
  payload: {
    declaration: IDeclaration
    client: ApolloClient<{}>
  }
}

interface IRemoveUnassignedDeclarationAction {
  type: typeof REMOVE_UNASSIGNED_DECLARATIONS
  payload: {
    currentlyDownloadedDeclarations: IDeclaration[]
    unassignedDeclarations: IDeclaration[]
  }
}

interface IDownloadDeclarationSuccess {
  type: typeof DOWNLOAD_DECLARATION_SUCCESS
  payload: {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    queryData: any
    form: {
      [key in EventType]: IForm
    }
    client: ApolloClient<{}>
    offlineData?: IOfflineData
    userDetails?: UserDetails
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

interface IUnassignDeclaration {
  type: typeof UNASSIGN_DECLARATION
  payload: {
    id: string
    client: ApolloClient<{}>
    refetchQueries?: InternalRefetchQueriesInclude
  }
}

interface IEnqueueUnassignDeclaration {
  type: typeof ENQUEUE_UNASSIGN_DECLARATION
  payload: {
    id: string
    client: ApolloClient<{}>
    refetchQueries?: InternalRefetchQueriesInclude
  }
}

interface IUnassignDeclarationSuccess {
  type: typeof UNASSIGN_DECLARATION_SUCCESS
  payload: {
    id: string
    client: ApolloClient<{}>
    refetchQueries: InternalRefetchQueriesInclude
  }
}

interface IUnassignDeclarationFailed {
  type: typeof UNASSIGN_DECLARATION_FAILED
  payload: {
    error: ApolloError
    declarationId: string
    client: ApolloClient<{}>
    refetchQueries?: InternalRefetchQueriesInclude
  }
}

type Action =
  | IArchiveDeclarationAction
  | IStoreDeclarationAction
  | IModifyDeclarationAction
  | IClearCorrectionAndPrintChanges
  | ISetInitialDeclarationsAction
  | IWriteDeclarationAction
  | IWriteDeclarationSuccessAction
  | IWriteDeclarationFailedAction
  | IDeleteDeclarationAction
  | IDeleteDeclarationSuccessAction
  | IDeleteDeclarationFailedAction
  | IGetStorageDeclarationsSuccessAction
  | IGetStorageDeclarationsFailedAction
  | IDownloadDeclaration
  | IDownloadDeclarationSuccess
  | IDownloadDeclarationFail
  | UserDetailsAvailable
  | UpdateRegistrarWorkqueueAction
  | ShowDownloadDeclarationFailedToast
  | IEnqueueUnassignDeclaration
  | IUnassignDeclaration
  | IUnassignDeclarationSuccess
  | IUnassignDeclarationFailed
  | IRemoveUnassignedDeclarationAction
  | ShowUnassignedDeclarations

export interface IUserData {
  userID: string
  userPIN?: string
  declarations: IDeclaration[]
  workqueue?: IWorkqueue
}

export interface IDeclarationsState {
  userID: string
  declarations: IDeclaration[]
  isWritingDraft: boolean
}

const initialState: IDeclarationsState = {
  userID: '',
  declarations: [],
  isWritingDraft: false
}

export function createDeclaration(event: EventType, initialData?: IFormData) {
  return {
    id: uuid(),
    data: initialData || {},
    event,
    submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
  }
}

function makeDeclarationReadyToDownload(
  event: EventType,
  compositionId: string,
  action: DeclarationAction
): IDeclaration {
  return {
    id: compositionId,
    data: {},
    event,
    action,
    downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
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

export function setInitialDeclarations() {
  return { type: SET_INITIAL_DECLARATION }
}

export function archiveDeclaration(
  declarationId: string,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
): IArchiveDeclarationAction {
  return {
    type: ARCHIVE_DECLARATION,
    payload: { declarationId, reason, comment, duplicateTrackingId }
  }
}

export function writeDeclaration(
  declaration: IDeclaration | IPrintableDeclaration,
  callback?: () => void
): IWriteDeclarationAction {
  declaration.modifiedOn = Date.now()
  return { type: WRITE_DECLARATION, payload: { declaration, callback } }
}

export async function getCurrentUserID(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')

  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as UserDetails).id || ''
}

async function getUserData(userId: string) {
  const userData = await storage.getItem('USER_DATA')
  const allUserData: IUserData[] = !userData
    ? []
    : (JSON.parse(userData) as IUserData[])
  const currentUserData = allUserData.find((uData) => uData.userID === userId)

  return { allUserData, currentUserData }
}

export async function writeDeclarationByUserWithoutStateUpdate(
  userId: string,
  declaration: IDeclaration
) {
  const uID = userId || (await getCurrentUserID())
  const userData = await getUserData(uID)
  const { allUserData } = userData
  let { currentUserData } = userData

  if (currentUserData) {
    currentUserData.declarations = [
      ...currentUserData.declarations.filter(
        (savedDeclaration) => savedDeclaration.id !== declaration.id
      ),
      declaration
    ]
  } else {
    currentUserData = {
      userID: uID,
      declarations: [declaration]
    }
    allUserData.push(currentUserData)
  }

  await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  return declaration
}

export const declarationsReducer: LoopReducer<IDeclarationsState, Action> = (
  state: IDeclarationsState = initialState,
  action: Action
) => {
  return state
}

function filterProcessingDeclarations(
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

function getProcessingDeclarationIds(declarations: IDeclaration[]) {
  return declarations
    .filter(
      (declaration) =>
        declaration.submissionStatus &&
        processingStates.includes(
          declaration.submissionStatus as SUBMISSION_STATUS
        )
    )
    .map((declaration) => declaration.id)
}

export function filterProcessingDeclarationsFromQuery(
  queryData: IQueryData,
  storedDeclarations: IDeclaration[]
): IQueryData {
  const processingDeclarationIds =
    getProcessingDeclarationIds(storedDeclarations)

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
    sentForReviewTab: filterProcessingDeclarations(
      queryData.sentForReviewTab,
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
    ),
    issueTab: filterProcessingDeclarations(
      queryData.issueTab,
      processingDeclarationIds
    )
  }
}
