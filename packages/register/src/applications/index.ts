import { Event, IFormData, IFormFieldValue } from '@register/forms'
import { Action as NavigationAction, GO_TO_PAGE } from '@register/navigation'
import { storage } from '@register/storage'
import { IUserDetails } from '@register/utils/userUtils'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import { v4 as uuid } from 'uuid'

const SET_INITIAL_APPLICATION = 'APPLICATION/SET_INITIAL_APPLICATION'
const STORE_APPLICATION = 'APPLICATION/STORE_APPLICATION'
const MODIFY_APPLICATION = 'APPLICATION/MODIFY_DRAFT'
const WRITE_APPLICATION = 'APPLICATION/WRITE_DRAFT'
const DELETE_APPLICATION = 'APPLICATION/DELETE_DRAFT'
const GET_APPLICATIONS_SUCCESS = 'APPLICATION/GET_DRAFTS_SUCCESS'
const GET_APPLICATIONS_FAILED = 'APPLICATION/GET_DRAFTS_FAILED'

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
  action?: string
  trackingId?: string
  compositionId?: string
  registrationNumber?: string
  payload?: IPayload
  visitedGroupIds?: IVisitedGroupId[]
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

export type Action =
  | IStoreApplicationAction
  | IModifyApplicationAction
  | ISetInitialApplicationsAction
  | IWriteApplicationAction
  | NavigationAction
  | IDeleteApplicationAction
  | IGetStorageApplicationsSuccessAction
  | IGetStorageApplicationsFailedAction

export interface IUserData {
  userID: string
  userPIN?: string
  applications: IApplication[]
}

export interface IApplicationsState {
  userID: string
  initialApplicationsLoaded: boolean
  applications: IApplication[]
}

const initialState = {
  userID: '',
  initialApplicationsLoaded: false,
  applications: []
}

export function createApplication(event: Event, initialData?: IFormData) {
  return {
    id: uuid(),
    data: initialData || {},
    event,
    submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
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
    default:
      return state
  }
}
