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
  Action as DeclarationAction,
  SubmissionAction,
  DownloadAction,
  IForm,
  IFormData,
  IFormFieldValue,
  IContactPoint,
  FieldValueMap,
  IAttachmentValue
} from '@client/forms'
import {
  Attachment,
  Event,
  History,
  Query,
  SystemRoleType
} from '@client/utils/gateway'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import {
  Action as NavigationAction,
  GO_TO_PAGE,
  IDynamicValues
} from '@client/navigation'
import {
  UserDetailsAvailable,
  USER_DETAILS_AVAILABLE
} from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import {
  gqlToDraftTransformer,
  draftToGqlTransformer
} from '@client/transformer'
import { transformSearchQueryDataToDraft } from '@client/utils/draftUtils'
import { getQueryMapping } from '@client/views/DataProvider/QueryProvider'
import type {
  GQLEventSearchResultSet,
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLRegistrationSearchSet,
  GQLHumanName,
  GQLMarriageEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import {
  ApolloClient,
  ApolloError,
  ApolloQueryResult,
  InternalRefetchQueriesInclude
} from '@apollo/client'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import { v4 as uuid } from 'uuid'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  showDownloadDeclarationFailedToast,
  ShowDownloadDeclarationFailedToast
} from '@client/notification/actions'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import { MARK_EVENT_UNASSIGNED } from '@client/views/DataProvider/birth/mutations'
import {
  UpdateRegistrarWorkqueueAction,
  updateRegistrarWorkqueue,
  IQueryData,
  IWorkqueue
} from '@client/workqueue'
import { isBase64FileString } from '@client/utils/commonUtils'
import {
  EMPTY_STRING,
  FIELD_AGENT_ROLES,
  SIGNATURE_KEYS
} from '@client/utils/constants'
import { ViewRecordQueries } from '@client/views/ViewRecord/query'
import { UserDetails } from '@client/utils/userUtils'
import { clearUnusedViewRecordCacheEntries } from '@client/utils/persistence'

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

export enum DOWNLOAD_STATUS {
  READY_TO_DOWNLOAD = 'READY_TO_DOWNLOAD',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK',
  READY_TO_UNASSIGN = 'READY_TO_UNASSIGN',
  UNASSIGNING = 'UNASSIGNING'
}

export const processingStates = [
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

const DOWNLOAD_MAX_RETRY_ATTEMPT = 3
interface IActionList {
  [key: string]: string
}

const ACTION_LIST: IActionList = {
  [DownloadAction.LOAD_REVIEW_DECLARATION]:
    DownloadAction.LOAD_REVIEW_DECLARATION,
  [DownloadAction.LOAD_CERTIFICATE_DECLARATION]:
    DownloadAction.LOAD_REVIEW_DECLARATION,
  [DownloadAction.LOAD_REQUESTED_CORRECTION_DECLARATION]:
    DownloadAction.LOAD_REVIEW_DECLARATION
}

export interface IPayload {
  [key: string]: IFormFieldValue
}

export interface IVisitedGroupId {
  sectionId: string
  groupId: string
}

export interface ITaskHistory {
  operationType?: string
  operatedOn?: string
  operatorRole?: string
  operatorName?: Array<GQLHumanName | null>
  operatorOfficeName?: string
  operatorOfficeAlias?: Array<string | null>
  notificationFacilityName?: string
  notificationFacilityAlias?: Array<string | null>
  rejectReason?: string
  rejectComment?: string
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
  event: Event
  registrationStatus?: string
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
  collector?: Partial<{ type: Relation | string }>
  corrector?: Partial<{ type: RelationForCertificateCorrection | string }>
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

export type Payment = {
  paymentId?: string
  type: PaymentType
  total: number
  amount: number
  outcome: PaymentOutcomeType
  date: number
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

interface IDownloadDeclarationSuccess {
  type: typeof DOWNLOAD_DECLARATION_SUCCESS
  payload: {
    queryData: any
    form: {
      [key in Event]: IForm
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
  }
}

export type Action =
  | IArchiveDeclarationAction
  | IStoreDeclarationAction
  | IModifyDeclarationAction
  | IClearCorrectionAndPrintChanges
  | ISetInitialDeclarationsAction
  | IWriteDeclarationAction
  | IWriteDeclarationSuccessAction
  | IWriteDeclarationFailedAction
  | NavigationAction
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

export function createReviewDeclaration(
  declarationId: string,
  formData: IFormData,
  event: Event,
  status?: string,
  duplicates?: IDuplicates[]
): IDeclaration {
  return {
    id: declarationId,
    data: formData,
    duplicates,
    originalData: formData,
    localData: formData,
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
  declaration: IPrintableDeclaration | Partial<IDeclaration>
): IModifyDeclarationAction {
  return { type: MODIFY_DECLARATION, payload: { declaration } }
}

export function clearCorrectionAndPrintChanges(
  declarationId: string
): IClearCorrectionAndPrintChanges {
  return {
    type: CLEAR_CORRECTION_AND_PRINT_CHANGES,
    payload: { declarationId }
  }
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

export const getStorageDeclarationsFailed =
  (): IGetStorageDeclarationsFailedAction => ({
    type: GET_DECLARATIONS_FAILED
  })

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

export function deleteDeclaration(
  declarationId: string,
  client: ApolloClient<{}>
): IDeleteDeclarationAction {
  return { type: DELETE_DECLARATION, payload: { declarationId, client } }
}

function deleteDeclarationSuccess(
  declarationId: string,
  client: ApolloClient<{}>
): IDeleteDeclarationSuccessAction {
  return {
    type: DELETE_DECLARATION_SUCCESS,
    payload: { declarationId, client }
  }
}

function deleteDeclarationFailed(): IDeleteDeclarationFailedAction {
  return { type: DELETE_DECLARATION_FAILED }
}

export function writeDeclaration(
  declaration: IDeclaration | IPrintableDeclaration,
  callback?: () => void
): IWriteDeclarationAction {
  declaration.modifiedOn = Date.now()
  return { type: WRITE_DECLARATION, payload: { declaration, callback } }
}

export function writeDeclarationSuccess(
  declaration: IDeclaration
): IWriteDeclarationSuccessAction {
  return { type: WRITE_DECLARATION_SUCCESS, payload: { declaration } }
}

export function writeDeclarationFailed(): IWriteDeclarationFailedAction {
  return { type: WRITE_DECLARATION_FAILED }
}

async function getCurrentUserSystemRole(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')

  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as UserDetails).systemRole || ''
}

export async function getCurrentUserID(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')

  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as UserDetails).userMgntUserID || ''
}

export async function getUserData(userId: string) {
  const userData = await storage.getItem('USER_DATA')
  const allUserData: IUserData[] = !userData
    ? []
    : (JSON.parse(userData) as IUserData[])
  const currentUserData = allUserData.find((uData) => uData.userID === userId)

  return { allUserData, currentUserData }
}

export function mergeDeclaredDeclarations(
  declarations: IDeclaration[],
  declaredDeclarations: GQLEventSearchSet[]
) {
  const localDeclarations = declarations.map((declaration) => declaration.id)

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

export async function getDeclarationsOfCurrentUser(): Promise<string> {
  // returns a 'stringified' IUserData
  const storageTable = await storage.getItem('USER_DATA')
  if (!storageTable) {
    return JSON.stringify({ declarations: [] })
  }

  const currentUserRole = await getCurrentUserSystemRole()
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
  let currentUserDeclarations: IDeclaration[] =
    (currentUserData && currentUserData.declarations) || []

  if (SystemRoleType.FieldAgent.includes(currentUserRole) && currentUserData) {
    currentUserDeclarations = currentUserData.declarations.filter((d) => {
      if (d.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED) {
        const history = d.originalData?.history as unknown as IDynamicValues

        const downloadedTime = (
          history.filter((h: IDynamicValues) => {
            return h.action === DOWNLOAD_STATUS.DOWNLOADED
          }) as IDynamicValues[]
        ).sort((fe, se) => {
          return new Date(se.date).getTime() - new Date(fe.date).getTime()
        })

        return (
          differenceInMinutes(new Date(), new Date(downloadedTime[0].date)) <
          1500 // 25 hours, used munites for better accuracy
        )
      }
      return true
    })

    // Storing the declarations again by excluding the 24 hours old downloaded declaration
    currentUserData.declarations = currentUserDeclarations
    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }

  const payload: IUserData = {
    userID: currentUserID,
    declarations: currentUserDeclarations
  }
  return JSON.stringify(payload)
}

export async function updateWorkqueueData(
  state: IStoreState,
  declaration: IDeclaration,
  workQueueId: keyof IQueryData,
  userWorkqueue?: IWorkqueue
) {
  if (!userWorkqueue || !userWorkqueue.data) {
    return
  }

  const workqueueApp = userWorkqueue.data[workQueueId]?.results?.find(
    (app) => app && app.id === declaration.id
  )
  if (!workqueueApp) {
    return
  }
  const sectionIds =
    declaration.event === 'birth'
      ? ['child']
      : declaration.event === 'death'
      ? ['deceased']
      : ['groom', 'bride']

  let transformedName: (GQLHumanName | null)[] | undefined
  let transformedNameForGroom: (GQLHumanName | null)[] | undefined
  let transformedNameForBride: (GQLHumanName | null)[] | undefined
  let transformedDeathDate: IFormFieldValue = EMPTY_STRING
  let transformedBirthDate: IFormFieldValue = EMPTY_STRING
  let transformedMarriageDate: IFormFieldValue = EMPTY_STRING
  let transformedInformantContactNumber = EMPTY_STRING

  if (declaration.event === 'marriage') {
    const groomSectionId = sectionIds[0]
    const brideSectionId = sectionIds[1]

    const groomSectionDefinition = getRegisterForm(state)[
      declaration.event
    ].sections.find((section) => section.id === groomSectionId)
    const brideSectionDefinition = getRegisterForm(state)[
      declaration.event
    ].sections.find((section) => section.id === brideSectionId)

    const transformedDeclarationForGroom = draftToGqlTransformer(
      // transforming required section only
      { sections: groomSectionDefinition ? [groomSectionDefinition] : [] },
      declaration.data
    )

    const transformedDeclarationForBride = draftToGqlTransformer(
      // transforming required section only
      { sections: brideSectionDefinition ? [brideSectionDefinition] : [] },
      declaration.data
    )

    transformedNameForGroom =
      (transformedDeclarationForGroom &&
        transformedDeclarationForGroom[groomSectionId] &&
        transformedDeclarationForGroom[groomSectionId].name) ||
      []
    transformedNameForBride =
      (transformedDeclarationForBride &&
        transformedDeclarationForBride[brideSectionId] &&
        transformedDeclarationForBride[brideSectionId].name) ||
      []
    transformedMarriageDate =
      (declaration.data &&
        declaration.data.marriageEvent &&
        declaration.data.marriageEvent.marriageDate) ||
      []
  } else {
    const sectionId = sectionIds[0]
    const sectionDefinition = getRegisterForm(state)[
      declaration.event
    ].sections.find((section) => section.id === sectionId)

    const transformedDeclaration = draftToGqlTransformer(
      // transforming required section only
      { sections: sectionDefinition ? [sectionDefinition] : [] },
      declaration.data
    )
    transformedName =
      (transformedDeclaration &&
        transformedDeclaration[sectionId] &&
        transformedDeclaration[sectionId].name) ||
      []
    transformedDeathDate =
      (declaration.data &&
        declaration.data.deathEvent &&
        declaration.data.deathEvent.deathDate) ||
      []
    transformedBirthDate =
      (declaration.data &&
        declaration.data.child &&
        declaration.data.child.childBirthDate) ||
      []
  }
  transformedInformantContactNumber =
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
  } else if (declaration.event === 'death') {
    ;(workqueueApp as GQLDeathEventSearchSet).deceasedName = transformedName
    ;(workqueueApp as GQLDeathEventSearchSet).dateOfDeath = transformedDeathDate
    ;(
      (workqueueApp as GQLDeathEventSearchSet)
        .registration as GQLRegistrationSearchSet
    ).contactNumber = transformedInformantContactNumber
  } else if (declaration.event === 'marriage') {
    ;(workqueueApp as GQLMarriageEventSearchSet).brideName =
      transformedNameForBride
    ;(workqueueApp as GQLMarriageEventSearchSet).groomName =
      transformedNameForGroom
    ;(workqueueApp as GQLMarriageEventSearchSet).dateOfMarriage =
      transformedMarriageDate
    ;(
      (workqueueApp as GQLMarriageEventSearchSet)
        .registration as GQLRegistrationSearchSet
    ).contactNumber = transformedInformantContactNumber
  }
}

export async function writeDeclarationByUser(
  getState: () => IStoreState,
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

  if (
    declaration.registrationStatus &&
    declaration.registrationStatus === 'REGISTERED'
  ) {
    updateWorkqueueData(
      getState(),
      declaration,
      'printTab',
      currentUserData.workqueue
    )
  }

  await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  return declaration
}

export async function deleteDeclarationByUser(
  userId: string,
  declarationId: string,
  state: IDeclarationsState
): Promise<string> {
  const uID = userId || (await getCurrentUserID())
  const { allUserData, currentUserData } = await getUserData(uID)

  allUserData.map((userData) => {
    if (userData.userID === state.userID) {
      userData.declarations = state.declarations
    }
    return userData
  })

  const deletedDeclarationId = currentUserData
    ? currentUserData.declarations.findIndex((app) => app.id === declarationId)
    : -1

  if (deletedDeclarationId >= 0) {
    currentUserData &&
      currentUserData.declarations.splice(deletedDeclarationId, 1)
    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
  }
  return declarationId
}

export function downloadDeclaration(
  event: Event,
  compositionId: string,
  action: DeclarationAction,
  client: ApolloClient<{}>
): IDownloadDeclaration {
  const declaration = makeDeclarationReadyToDownload(
    event,
    compositionId,
    action
  )
  return {
    type: ENQUEUE_DOWNLOAD_DECLARATION,
    payload: {
      declaration,
      client
    }
  }
}

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
  mainRequest: Promise<ApolloQueryResult<Query>>,
  getState: () => IStoreState,
  client: ApolloClient<{}>
) {
  const store = getState()
  return new Promise(async (resolve, reject) => {
    try {
      const data = await mainRequest
      const userDetails = getUserDetails(getState())
      if (
        !FIELD_AGENT_ROLES.includes(userDetails?.systemRole as SystemRoleType)
      ) {
        await fetchAllDuplicateDeclarations(data.data)
      }
      const duplicateDeclarations = await fetchAllDuplicateDeclarations(
        data.data
      )

      const allduplicateDeclarationsAttachments = (duplicateDeclarations ?? [])
        .map(
          (declaration) =>
            declaration.data.fetchRegistrationForViewing?.registration
        )
        .flatMap((registration) => registration?.attachments)
        .map((attachment) => attachment?.data)
        .filter((maybeUrl): maybeUrl is string => Boolean(maybeUrl))

      const allfetchableURLs = [
        ...getAttachmentUrls(data.data),
        ...getSignatureUrls(data.data),
        ...getProfileIconUrls(data.data),
        ...allduplicateDeclarationsAttachments
      ]

      await Promise.all(
        allfetchableURLs.map((url) => fetch(url).then((res) => res.blob()))
      )

      resolve({ data, store, client })
    } catch (error) {
      reject(error)
    }
  })
}

function getProfileIconUrls(queryResultData: Query) {
  const history =
    queryResultData.fetchBirthRegistration?.history ||
    queryResultData.fetchDeathRegistration?.history ||
    queryResultData.fetchMarriageRegistration?.history

  const userAvatars = (history ?? [])
    .filter((h): h is History => Boolean(h))
    .map((h) => h.user?.avatar?.data)
    .filter((maybeUrl): maybeUrl is string => Boolean(maybeUrl))

  return [...new Set(userAvatars).values()]
}

function getAttachmentUrls(queryResultData: Query) {
  const registration =
    queryResultData.fetchBirthRegistration?.registration ||
    queryResultData.fetchDeathRegistration?.registration ||
    queryResultData.fetchMarriageRegistration?.registration

  return (registration?.attachments ?? [])
    .filter((a): a is Attachment => Boolean(a))
    .map((a) => a.data)
    .filter((maybeUrl): maybeUrl is string => Boolean(maybeUrl))
}

function getSignatureUrls(queryResultData: Query) {
  const registration =
    queryResultData.fetchBirthRegistration?.registration ||
    queryResultData.fetchDeathRegistration?.registration ||
    queryResultData.fetchMarriageRegistration?.registration

  return SIGNATURE_KEYS.map(
    (propertyKey) => registration?.[propertyKey]
  ).filter((maybeUrl): maybeUrl is string => Boolean(maybeUrl))
}

async function fetchAllDuplicateDeclarations(queryResultData: Query) {
  const registration =
    queryResultData.fetchBirthRegistration?.registration ||
    queryResultData.fetchDeathRegistration?.registration

  const duplicateCompositionIds = registration?.duplicates?.map(
    (duplicate) => duplicate?.compositionId
  )

  if (!duplicateCompositionIds || !duplicateCompositionIds?.length) {
    return
  }

  const fetchAllDuplicates = duplicateCompositionIds.map((id) =>
    ViewRecordQueries.fetchDuplicateDeclarations(id as string)
  )

  return Promise.all(fetchAllDuplicates)
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
      userDetails: getUserDetails(store) as UserDetails
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

export function executeUnassignDeclaration(
  id: string,
  client: ApolloClient<{}>,
  refetchQueries?: InternalRefetchQueriesInclude
): IUnassignDeclaration {
  return {
    type: UNASSIGN_DECLARATION,
    payload: {
      id,
      client,
      refetchQueries
    }
  }
}

export function unassignDeclaration(
  id: string,
  client: ApolloClient<{}>,
  refetchQueries?: InternalRefetchQueriesInclude
): IEnqueueUnassignDeclaration {
  return {
    type: ENQUEUE_UNASSIGN_DECLARATION,
    payload: {
      id,
      client,
      refetchQueries
    }
  }
}

function unassignDeclarationSuccess([id, client]: [
  string,
  ApolloClient<{}>
]): IUnassignDeclarationSuccess {
  return {
    type: UNASSIGN_DECLARATION_SUCCESS,
    payload: {
      id,
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

      if (
        !declaration ||
        declaration.data[action.payload.pageId] ||
        action.payload.pageId === 'preview' ||
        action.payload.pageId === 'review'
      ) {
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
    case STORE_DECLARATION:
      return {
        ...state,
        declarations: state.declarations.concat(action.payload.declaration)
      }
    case DELETE_DECLARATION: {
      const { declarationId, client: clientFromDeleteDeclaration } =
        action.payload
      return loop(
        {
          ...state,
          declarations: state.declarations.map((declaration) =>
            declaration.id === declarationId
              ? { ...declaration, writingDraft: true }
              : declaration
          )
        },
        Cmd.run(deleteDeclarationByUser, {
          successActionCreator: (id: string) =>
            deleteDeclarationSuccess(id, clientFromDeleteDeclaration),
          failActionCreator: deleteDeclarationFailed,
          args: [state.userID, action.payload.declarationId, state]
        })
      )
    }
    case DELETE_DECLARATION_SUCCESS:
      const declarationToDelete = state.declarations.find(
        (declaration) => declaration.id === action.payload.declarationId
      )
      const declarationMinioUrls =
        getMinioUrlsFromDeclaration(declarationToDelete)

      postMinioUrlsToServiceWorker(declarationMinioUrls)

      const declarationsWithoutDeleted = state.declarations.filter(
        ({ id }) => id !== action.payload.declarationId
      )

      clearUnusedViewRecordCacheEntries(
        action.payload.client.cache,
        declarationsWithoutDeleted
      )

      return {
        ...state,
        declarations: declarationsWithoutDeleted
      }
    case MODIFY_DECLARATION:
      const newDeclarations = [...state.declarations]
      const currentDeclarationIndex = newDeclarations.findIndex(
        (declaration) => declaration.id === action.payload.declaration.id
      )
      const modifiedDeclaration = { ...action.payload.declaration }

      if (modifiedDeclaration.data?.informant?.relationship) {
        modifiedDeclaration.data.informant.relationship = (
          modifiedDeclaration.data.registration.informantType as FieldValueMap
        )?.value
      }

      newDeclarations[currentDeclarationIndex] = {
        ...newDeclarations[currentDeclarationIndex],
        ...modifiedDeclaration
      }

      return {
        ...state,
        declarations: newDeclarations
      }
    case CLEAR_CORRECTION_AND_PRINT_CHANGES: {
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

      return loop(
        {
          ...state,
          declarations: state.declarations.map((declaration, index) => {
            if (index === declarationIndex) {
              return orignalAppliation
            }
            return declaration
          })
        },
        Cmd.action(modifyDeclaration(orignalAppliation))
      )
    }

    case WRITE_DECLARATION: {
      const {
        declaration: { id }
      } = action.payload
      return loop(
        {
          ...state,
          declarations: state.declarations.map((stateDeclaration) =>
            id === stateDeclaration.id
              ? { ...stateDeclaration, writingDraft: true }
              : stateDeclaration
          )
        },
        Cmd.run(writeDeclarationByUser, {
          successActionCreator: (declaration: IDeclaration) => {
            if (action.payload.callback) {
              action.payload.callback()
            }
            return writeDeclarationSuccess(declaration)
          },
          failActionCreator: writeDeclarationFailed,
          args: [Cmd.getState, state.userID, action.payload.declaration]
        })
      )
    }
    case WRITE_DECLARATION_SUCCESS: {
      const { declaration } = action.payload
      return {
        ...state,
        declarations: state.declarations.map((stateDeclaration) =>
          declaration.id === stateDeclaration.id
            ? { ...declaration, writingDraft: false }
            : stateDeclaration
        )
      }
    }
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
      const updateWorkqueue = () =>
        updateRegistrarWorkqueue(
          userDetails?.practitionerId,
          10,
          Boolean(
            userDetails?.systemRole &&
              FIELD_AGENT_ROLES.includes(userDetails.systemRole)
          )
        )

      newDeclarationsAfterDownload[downloadingDeclarationIndex] =
        createReviewDeclaration(
          downloadingDeclaration.id,
          transData,
          downloadingDeclaration.event,
          downloadedAppStatus,
          eventData?.registration?.duplicates?.filter(
            (duplicate: IDuplicates) => !!duplicate
          )
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
          Cmd.list<IDownloadDeclarationFail | UpdateRegistrarWorkqueueAction>(
            [
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
              }),
              Cmd.action(updateWorkqueue())
            ],
            { sequence: true }
          )
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
        Cmd.list<IDownloadDeclarationFail | UpdateRegistrarWorkqueueAction>(
          [
            Cmd.run(writeDeclarationByUser, {
              args: [
                Cmd.getState,
                state.userID,
                newDeclarationsAfterDownload[downloadingDeclarationIndex]
              ],
              failActionCreator: downloadDeclarationFail
            }),
            Cmd.action(updateWorkqueue()),
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
          action: SubmissionAction.ARCHIVE_DECLARATION,
          payload: {
            id: declaration.id,
            reason: action.payload.reason || '',
            comment: action.payload.comment || '',
            duplicateTrackingId: action.payload.duplicateTrackingId || ''
          }
        }
        return loop(state, Cmd.action(writeDeclaration(modifiedDeclaration)))
      }
      return state
    case ENQUEUE_UNASSIGN_DECLARATION:
      const queueIndex = state.declarations.findIndex(
        ({ id }) => id === action.payload.id
      )
      const isQueueBusy = state.declarations.some((declaration) =>
        [
          DOWNLOAD_STATUS.READY_TO_UNASSIGN,
          DOWNLOAD_STATUS.UNASSIGNING
        ].includes(declaration.downloadStatus as DOWNLOAD_STATUS)
      )
      const updatedDeclarationsQueue = state.declarations
      if (queueIndex === -1) {
        // Not found locally, unassigning others declaration
        updatedDeclarationsQueue.push({
          id: action.payload.id,
          downloadStatus: DOWNLOAD_STATUS.READY_TO_UNASSIGN
        } as IDeclaration)
      } else {
        updatedDeclarationsQueue[queueIndex].downloadStatus =
          DOWNLOAD_STATUS.READY_TO_UNASSIGN
      }

      return loop(
        {
          ...state,
          declarations: updatedDeclarationsQueue
        },
        isQueueBusy
          ? Cmd.none
          : Cmd.action(
              executeUnassignDeclaration(
                action.payload.id,
                action.payload.client,
                action.payload.refetchQueries
              )
            )
      )
    case UNASSIGN_DECLARATION:
      const unassignIndex = state.declarations.findIndex(
        ({ id }) => id === action.payload.id
      )
      const updatedDeclarationsUnassign = state.declarations
      updatedDeclarationsUnassign[unassignIndex].downloadStatus =
        DOWNLOAD_STATUS.UNASSIGNING
      return loop(
        {
          ...state,
          declarations: updatedDeclarationsUnassign
        },
        Cmd.run(
          async () => {
            await action.payload.client.mutate({
              mutation: MARK_EVENT_UNASSIGNED,
              variables: { id: action.payload.id },
              refetchQueries: action.payload.refetchQueries
            })
            return [action.payload.id, action.payload.client]
          },
          {
            successActionCreator: unassignDeclarationSuccess
          }
        )
      )
    case UNASSIGN_DECLARATION_SUCCESS:
      const declarationNextToUnassign = state.declarations.find(
        (declaration) =>
          declaration.downloadStatus === DOWNLOAD_STATUS.READY_TO_UNASSIGN
      )
      return loop(
        state,
        Cmd.list<
          | IDeleteDeclarationAction
          | UpdateRegistrarWorkqueueAction
          | IUnassignDeclaration
        >(
          [
            Cmd.action(
              deleteDeclaration(action.payload.id, action.payload.client)
            ),
            Cmd.action(updateRegistrarWorkqueue()),
            declarationNextToUnassign
              ? Cmd.action(
                  executeUnassignDeclaration(
                    declarationNextToUnassign.id,
                    action.payload.client
                  )
                )
              : Cmd.none
          ],
          { sequence: true }
        )
      )
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

export function getMinioUrlsFromDeclaration(
  declaration: IDeclaration | undefined
) {
  if (!declaration) {
    return []
  }
  const minioUrls: string[] = SIGNATURE_KEYS.map(
    (propertyKey) => declaration.originalData?.registration?.[propertyKey]
  ).filter((maybeUrl): maybeUrl is string => Boolean(maybeUrl))

  const documentsData = declaration.originalData?.documents as Record<
    string,
    IAttachmentValue[]
  >

  const userAvatars: string[] = Object.values(
    declaration.originalData?.history || []
  )
    .map((history) => {
      if (
        typeof history === 'object' &&
        history !== null &&
        'user' in history
      ) {
        const user = history.user as { avatar?: { data?: string } }
        return user?.avatar?.data
      }
      return null
    })
    .filter((avatarData): avatarData is string => Boolean(avatarData))

  minioUrls.push(...userAvatars)

  if (!documentsData) {
    return minioUrls
  }
  const docSections = Object.values(documentsData)

  for (const docSection of docSections) {
    for (const doc of docSection) {
      if (doc.data && !isBase64FileString(doc.data)) {
        minioUrls.push(doc.data)
      }
    }
  }
  return minioUrls
}

export function postMinioUrlsToServiceWorker(minioUrls: string[]) {
  navigator?.serviceWorker?.controller?.postMessage({
    minioUrls: minioUrls
  })
}
export function getProcessingDeclarationIds(declarations: IDeclaration[]) {
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
