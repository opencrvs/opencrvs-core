import { IFormData, Event } from '../forms'
import { GO_TO_TAB, Action as NavigationAction } from 'src/navigation'
import { storage } from 'src/storage'
import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import { v4 as uuid } from 'uuid'
import { IUserDetails } from 'src/utils/userUtils'
import { AES, enc } from 'crypto-js'

const SET_INITIAL_DRAFTS = 'DRAFTS/SET_INITIAL_DRAFTS'
const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'
const WRITE_DRAFT = 'DRAFTS/WRITE_DRAFT'
const DELETE_DRAFT = 'DRAFTS/DELETE_DRAFT'
const GET_DRAFTS_SUCCESS = 'DRAFTS/GET_DRAFTS_SUCCESS'
const GET_DRAFTS_FAILED = 'DRAFTS/GET_DRAFTS_FAILED'

const encryptionKey = '1q@w3E4r%t6Y7u*i9O0p_' // saved the secret key here for now

export interface IDraft {
  id: string
  data: IFormData
  savedOn?: number
  modifiedOn?: number
  eventType?: string
  review?: boolean
  event: Event
  status?: string
}

interface IStoreDraftAction {
  type: typeof STORE_DRAFT
  payload: { draft: IDraft }
}

interface IModifyDraftAction {
  type: typeof MODIFY_DRAFT
  payload: {
    draft: IDraft
  }
}

export interface IWriteDraftAction {
  type: typeof WRITE_DRAFT
  payload: {
    draft: IDraftsState
  }
}

interface ISetInitialDraftsAction {
  type: typeof SET_INITIAL_DRAFTS
}

interface IDeleteDraftAction {
  type: typeof DELETE_DRAFT
  payload: {
    draft: IDraft
  }
}

interface IGetStorageDraftsSuccessAction {
  type: typeof GET_DRAFTS_SUCCESS
  payload: string
}

interface IGetStorageDraftsFailedAction {
  type: typeof GET_DRAFTS_FAILED
}

export type Action =
  | IStoreDraftAction
  | IModifyDraftAction
  | ISetInitialDraftsAction
  | IWriteDraftAction
  | NavigationAction
  | IDeleteDraftAction
  | IGetStorageDraftsSuccessAction
  | IGetStorageDraftsFailedAction

export interface IUserData {
  userID: string
  drafts: IDraft[]
  userPIN: string
}

export interface IUserDataEncrypted {
  userID: string
  userPIN: string
  draftsEncrypted: string
}

export interface IDraftsState {
  userID: string
  initialDraftsLoaded: boolean
  drafts: IDraft[]
}

const initialState = {
  userID: '',
  initialDraftsLoaded: false,
  drafts: []
}

export function createDraft(event: Event) {
  return { id: uuid(), data: {}, event }
}
export function createReviewDraft(
  draftId: string,
  formData: IFormData,
  event: Event,
  status?: string
): IDraft {
  return { id: draftId, data: formData, review: true, event, status }
}

export function storeDraft(draft: IDraft): IStoreDraftAction {
  draft.savedOn = Date.now()
  return { type: STORE_DRAFT, payload: { draft } }
}

export function modifyDraft(draft: IDraft): IModifyDraftAction {
  draft.modifiedOn = Date.now()
  return { type: MODIFY_DRAFT, payload: { draft } }
}
export function setInitialDrafts() {
  return { type: SET_INITIAL_DRAFTS }
}

export const getStorageDraftsSuccess = (
  response: string
): IGetStorageDraftsSuccessAction => ({
  type: GET_DRAFTS_SUCCESS,
  payload: response
})

export const getStorageDraftsFailed = (): IGetStorageDraftsFailedAction => ({
  type: GET_DRAFTS_FAILED
})

export function deleteDraft(draft: IDraft): IDeleteDraftAction {
  return { type: DELETE_DRAFT, payload: { draft } }
}

function writeDraft(draft: IDraftsState): IWriteDraftAction {
  return { type: WRITE_DRAFT, payload: { draft } }
}

export const draftsReducer: LoopReducer<IDraftsState, Action> = (
  state: IDraftsState = initialState,
  action: Action
): IDraftsState | Loop<IDraftsState, Action> => {
  switch (action.type) {
    case GO_TO_TAB: {
      const draft = state.drafts.find(({ id }) => id === action.payload.draftId)

      if (!draft || draft.data[action.payload.tabId]) {
        return state
      }
      const modifiedDraft = {
        ...draft,
        data: {
          ...draft.data,
          [action.payload.tabId]: {}
        }
      }
      return loop(state, Cmd.action(modifyDraft(modifiedDraft)))
    }
    case STORE_DRAFT:
      const stateAfterDraftStore = {
        ...state,
        drafts: state.drafts ? state.drafts.concat(action.payload.draft) : []
      }
      return loop(
        stateAfterDraftStore,
        Cmd.action(writeDraft(stateAfterDraftStore))
      )
    case DELETE_DRAFT:
      const deleteIndex = state.drafts
        ? state.drafts.findIndex(draft => draft.id === action.payload.draft.id)
        : -1
      if (deleteIndex >= 0) {
        state.drafts.splice(deleteIndex, 1)
      }
      const stateAfterDraftDeletion = {
        ...state,
        drafts: state.drafts || []
      }
      return loop(
        stateAfterDraftDeletion,
        Cmd.action(writeDraft(stateAfterDraftDeletion))
      )
    case MODIFY_DRAFT:
      const newDrafts: IDraft[] = state.drafts || []
      const currentDraftIndex = newDrafts.findIndex(
        draft => draft.id === action.payload.draft.id
      )
      if (currentDraftIndex >= 0) {
        newDrafts[currentDraftIndex] = action.payload.draft
      } else {
        newDrafts.push(action.payload.draft)
      }
      const stateAfterDraftModification = {
        ...state,
        drafts: newDrafts
      }
      return loop(
        stateAfterDraftModification,
        Cmd.action(writeDraft(stateAfterDraftModification))
      )
    case WRITE_DRAFT:
      if (state.initialDraftsLoaded && state.drafts) {
        writeDraftByUser(action.payload.draft)
      }
      return state
    case SET_INITIAL_DRAFTS:
      return loop(
        {
          ...state
        },
        Cmd.run<IGetStorageDraftsSuccessAction | IGetStorageDraftsFailedAction>(
          getDraftsOfCurrentUser,
          {
            successActionCreator: getStorageDraftsSuccess,
            failActionCreator: getStorageDraftsFailed,
            args: []
          }
        )
      )
    case GET_DRAFTS_SUCCESS:
      if (action.payload) {
        const idDrafts = JSON.parse(action.payload) as IUserData
        return {
          ...state,
          userID: idDrafts.userID,
          drafts: idDrafts.drafts,
          initialDraftsLoaded: true
        }
      }
      return {
        ...state,
        initialDraftsLoaded: true
      }
    default:
      return state
  }
}

export async function getDraftsOfCurrentUser(): Promise<string> {
  // returns a 'stringified' IUserData
  const storageTable = await storage.getItem('USER_DATA')
  if (!storageTable) {
    return '{}'
  }

  const currentUserID = await getCurrentUserID()
  const currentUserPIN = await storage.getItem('pin')
  const allUserDataEncrypted = JSON.parse(storageTable) as IUserDataEncrypted[]
  if (!allUserDataEncrypted.length) {
    // No user-data at all
    const payloadWithoutDrafts: IUserData = {
      userID: currentUserID,
      userPIN: currentUserPIN,
      drafts: []
    }
    return JSON.stringify(payloadWithoutDrafts)
  }

  const currentUserDataEncrypted = allUserDataEncrypted.find(
    uData => uData.userID === currentUserID
  )

  if (!currentUserDataEncrypted || !currentUserDataEncrypted.draftsEncrypted) {
    return JSON.stringify({
      userID: currentUserID,
      userPIN: currentUserPIN,
      drafts: []
    })
  }

  const decryption = AES.decrypt(
    currentUserDataEncrypted.draftsEncrypted,
    encryptionKey
  )
  const currentUserDrafts = JSON.parse(
    enc.Utf8.stringify(decryption)
  ) as IDraft[]
  const payload: IUserData = {
    userID: currentUserID,
    userPIN: currentUserPIN,
    drafts: currentUserDrafts
  }
  return JSON.stringify(payload)
}

export async function writeDraftByUser(draftsState: IDraftsState) {
  const uID = draftsState.userID || (await getCurrentUserID())
  const str = await storage.getItem('USER_DATA')
  if (!str) {
    // No storage option found
    storage.configStorage('OpenCRVS')
  }
  const allUserDataEncrypted: IUserDataEncrypted[] = !str ? [] : JSON.parse(str)
  const currentUserDataEncrypted = allUserDataEncrypted.find(
    uData => uData.userID === uID
  )
  const drafts = JSON.stringify(draftsState.drafts)

  if (currentUserDataEncrypted) {
    currentUserDataEncrypted.draftsEncrypted = AES.encrypt(
      drafts,
      encryptionKey
    ).toString()
  } else {
    const pin = await storage.getItem('pin')
    allUserDataEncrypted.push({
      userID: uID,
      userPIN: pin,
      draftsEncrypted: AES.encrypt(drafts, encryptionKey).toString()
    })
  }
  storage.setItem('USER_DATA', JSON.stringify(allUserDataEncrypted))
}

export async function getCurrentUserID(): Promise<string> {
  const str = await storage.getItem('USER_DETAILS')
  if (!str) {
    return ''
  }
  return (JSON.parse(str) as IUserDetails).userMgntUserID || ''
}
