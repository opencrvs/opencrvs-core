import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import { storage } from '@register/storage'
import { v4 as uuid } from 'uuid'
import { Event, IFormData, IFormFieldValue } from '@register/forms'
import { GO_TO_PAGE, Action as NavigationAction } from '@register/navigation'
import { IUserDetails } from '@register/utils/userUtils'

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
  READY_TO_REGISTER = 'READY_TO_REGISTER',
  REGISTERING = 'REGISTERING',
  REGISTERED = 'REGISTERED',
  READY_TO_REJECT = 'READY_TO_REJECT',
  REJECTING = 'REJECTING',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  FAILED_NETWORK = 'FAILED_NETWORK'
}

export interface IPayload {
  [key: string]: IFormFieldValue
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
}

interface IStoreApplicationAction {
  type: typeof STORE_APPLICATION
  payload: { application: IApplication }
}

interface IModifyApplicationAction {
  type: typeof MODIFY_APPLICATION
  payload: {
    application: IApplication
  }
}

export interface IWriteApplicationAction {
  type: typeof WRITE_APPLICATION
  payload: {
    application: IApplicationsState
  }
}

interface ISetInitialApplicationsAction {
  type: typeof SET_INITIAL_APPLICATION
}

interface IDeleteApplicationAction {
  type: typeof DELETE_APPLICATION
  payload: {
    application: IApplication
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

export function createApplication(event: Event) {
  return {
    id: uuid(),
    data: {},
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
  application: IApplication
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
  application: IApplication
): IDeleteApplicationAction {
  return { type: DELETE_APPLICATION, payload: { application } }
}

function writeApplication(
  application: IApplicationsState
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
    return '{}'
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
  applicationsState: IApplicationsState
) {
  const uID = applicationsState.userID || (await getCurrentUserID())
  const userData = await storage.getItem('USER_DATA')
  if (!userData) {
    // No storage option found
    storage.configStorage('OpenCRVS')
  }
  const allUserData: IUserData[] = !userData
    ? []
    : (JSON.parse(userData) as IUserData[])
  const currentUserData = allUserData.find(uData => uData.userID === uID)

  if (currentUserData) {
    currentUserData.applications = applicationsState.applications
  } else {
    allUserData.push({
      userID: uID,
      applications: applicationsState.applications
    })
  }
  storage.setItem('USER_DATA', JSON.stringify(allUserData))
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
      const stateAfterStoringApplication = {
        ...state,
        applications: state.applications
          ? state.applications.concat(action.payload.application)
          : [action.payload.application]
      }
      return loop(
        stateAfterStoringApplication,
        Cmd.action(writeApplication(stateAfterStoringApplication))
      )
    case DELETE_APPLICATION:
      const deleteIndex = state.applications
        ? state.applications.findIndex(
            application => application.id === action.payload.application.id
          )
        : -1
      if (deleteIndex >= 0) {
        state.applications.splice(deleteIndex, 1)
      }
      const stateAfterApplicationDeletion = {
        ...state,
        drafts: state.applications || []
      }
      return loop(
        stateAfterApplicationDeletion,
        Cmd.action(writeApplication(stateAfterApplicationDeletion))
      )
    case MODIFY_APPLICATION:
      const newApplications: IApplication[] = state.applications || []
      const currentApplicationIndex = newApplications.findIndex(
        application => application.id === action.payload.application.id
      )
      newApplications[currentApplicationIndex] = action.payload.application
      const stateAfterApplicationModification = {
        ...state,
        applications: newApplications
      }
      return loop(
        stateAfterApplicationModification,
        Cmd.action(writeApplication(stateAfterApplicationModification))
      )
    case WRITE_APPLICATION:
      if (state.initialApplicationsLoaded && state.applications) {
        writeApplicationByUser(action.payload.application)
      }
      return state
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
