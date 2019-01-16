import { IFormData } from '../forms'
import { GO_TO_TAB, Action as NavigationAction } from 'src/navigation'
import { storage } from 'src/storage'
import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import { v4 as uuid } from 'uuid'

const SET_INITIAL_DRAFTS = 'DRAFTS/SET_INITIAL_DRAFTS'
const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'
const WRITE_DRAFT = 'DRAFTS/WRITE_DRAFT'
const DELETE_DRAFT = 'DRAFTS/DELETE_DRAFT'

export interface IDraft {
  id: string
  data: IFormData
  savedOn?: number
  eventType?: string
  review?: boolean
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
  payload: {
    drafts: IDraft[]
  }
}

interface IDeleteDraftAction {
  type: typeof DELETE_DRAFT
  payload: {
    draft: IDraft
  }
}

type Action =
  | IStoreDraftAction
  | IModifyDraftAction
  | ISetInitialDraftsAction
  | IWriteDraftAction
  | NavigationAction
  | IDeleteDraftAction

export interface IDraftsState {
  initialDraftsLoaded: boolean
  drafts: IDraft[]
}

const initialState = {
  initialDraftsLoaded: false,
  drafts: []
}

export function createDraft(eventType: string) {
  return { id: uuid(), data: {}, eventType }
}
export function createReviewDraft(
  draftId: string,
  formData: IFormData
): IDraft {
  return { id: draftId, data: formData, review: true }
}

export function storeDraft(draft: IDraft): IStoreDraftAction {
  draft.savedOn = Date.now()
  return { type: STORE_DRAFT, payload: { draft } }
}

export function modifyDraft(draft: IDraft): IModifyDraftAction {
  return { type: MODIFY_DRAFT, payload: { draft } }
}
export function setInitialDrafts(drafts: IDraftsState) {
  return { type: SET_INITIAL_DRAFTS, payload: { drafts } }
}

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
        storage.setItem('drafts', JSON.stringify(action.payload.draft.drafts))
      }
      return state
    case SET_INITIAL_DRAFTS:
      return {
        ...state,
        initialDraftsLoaded: true,
        drafts: action.payload.drafts
      }
    default:
      return state
  }
}
