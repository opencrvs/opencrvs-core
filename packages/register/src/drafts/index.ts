import { IFormData, Event } from '../forms'
import { GO_TO_TAB, Action as NavigationAction } from 'src/navigation'
import { storage } from 'src/storage'
import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import { v4 as uuid } from 'uuid'

const SET_INITIAL_DRAFTS = 'DRAFTS/SET_INITIAL_DRAFTS'
const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'
const WRITE_DRAFT = 'DRAFTS/WRITE_DRAFT'
const DELETE_DRAFT = 'DRAFTS/DELETE_DRAFT'
const GET_DRAFTS_SUCCESS = 'DRAFTS/GET_DRAFTS_SUCCESS'
const GET_DRAFTS_FAILED = 'DRAFTS/GET_DRAFTS_FAILED'

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

interface IWriteDraftAction {
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

type Action =
  | IStoreDraftAction
  | IModifyDraftAction
  | ISetInitialDraftsAction
  | IWriteDraftAction
  | NavigationAction
  | IDeleteDraftAction
  | IGetStorageDraftsSuccessAction
  | IGetStorageDraftsFailedAction

interface IUserData {
  userID: string
  drafts: IDraft[]
  userPIN: number
}

export interface IDraftsState {
  initialDraftsLoaded: boolean
  drafts: IDraft[]
}

const initialState = {
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
  console.log(action.type, state.drafts, action)
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
        drafts: state.drafts.concat(action.payload.draft)
      }
      return loop(
        stateAfterDraftStore,
        Cmd.action(writeDraft(stateAfterDraftStore))
      )
    case DELETE_DRAFT:
      const deleteIndex = state.drafts.findIndex(draft => {
        return draft.id === action.payload.draft.id
      })
      if (deleteIndex >= 0) {
        state.drafts.splice(deleteIndex, 1)
      }
      const stateAfterDraftDeletion = {
        ...state,
        drafts: state.drafts
      }
      return loop(
        stateAfterDraftDeletion,
        Cmd.action(writeDraft(stateAfterDraftDeletion))
      )
    case MODIFY_DRAFT:
      const stateAfterDraftModification = {
        ...state,
        drafts: state.drafts.map(draft => {
          if (draft.id === action.payload.draft.id) {
            return action.payload.draft
          }
          return draft
        })
      }
      return loop(
        stateAfterDraftModification,
        Cmd.action(writeDraft(stateAfterDraftModification))
      )
    case WRITE_DRAFT:
      if (state.initialDraftsLoaded && state.drafts) {
        console.log('action.payload.draft', action.payload.draft.drafts)
        writeDraftByUser('userID', action.payload.draft.drafts)
      }
      return state
    case SET_INITIAL_DRAFTS:
      return loop(
        {
          ...state
        },
        Cmd.run<IGetStorageDraftsSuccessAction | IGetStorageDraftsFailedAction>(
          getDraftsOfUser,
          {
            successActionCreator: getStorageDraftsSuccess,
            failActionCreator: getStorageDraftsFailed,
            args: ['userID']
          }
        )
      )
    case GET_DRAFTS_SUCCESS:
      const draftsString = action.payload
      const drafts = JSON.parse(draftsString ? draftsString : '[]')
      return {
        ...state,
        drafts,
        initialDraftsLoaded: true
      }
    default:
      return state
  }
}

async function getDraftsOfUser(userID: string): Promise<string> {
  console.log('getDraftsOfUser')
  const AllUserData = JSON.parse(
    await storage.getItem('USER_DATA')
  ) as IUserData[]
  if (!AllUserData) {
    console.log('No userdata draft found!')
    return ''
  }
  let drafts: IDraft[] = []
  AllUserData.some(uData => {
    if (uData.userID === userID) {
      drafts = uData.drafts
    }
    return uData.userID === userID
  })
  return JSON.stringify(drafts)
}

async function writeDraftByUser(userID: string, newDrafts: IDraft[]) {
  console.log('writeDraftByUser')
  console.log('NEW DRAFTS', newDrafts)
  const str = await storage.getItem('USER_DATA')
  console.log('str.length', str)
  const AllUserData: IUserData[] =
    str === '[]' ? [] : (JSON.parse(str) as IUserData[])
  const max = AllUserData.length
  let currentUserData: IUserData | null = null
  for (let i = 0; i < max; i++) {
    if (AllUserData[i].userID === userID) {
      currentUserData = AllUserData[i]
      break
    }
  }
  if (currentUserData != null) {
    currentUserData.drafts = newDrafts
  } else {
    AllUserData.push({
      userID,
      userPIN: 1212,
      drafts: newDrafts
    })
  }

  console.log(
    'currentUserData.drafts',
    currentUserData ? currentUserData.drafts : null
  )

  AllUserData.forEach(uDet => {
    if (uDet.userID === userID) {
      uDet = currentUserData as IUserData
    }
  })
  console.log('AllUserData', AllUserData)
  storage.setItem('USER_DATA', JSON.stringify(AllUserData))
}
