import { IFormData } from '../forms'
import { GO_TO_TAB, Action as NavigationAction } from 'src/navigation'
import { loop, Cmd, getModel } from 'redux-loop'
import { storage } from 'src/storage'

const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'
const SET_INITIAL_DRAFTS = 'DRAFTS/SET_INITIAL_DRAFTS'

export interface IDraft {
  id: number
  data: IFormData
}

type StoreDraftAction = {
  type: typeof STORE_DRAFT
  payload: { draft: IDraft }
}

type ModifyDraftAction = {
  type: typeof MODIFY_DRAFT
  payload: {
    draft: IDraft
  }
}

type SetInitialDraftsAction = {
  type: typeof SET_INITIAL_DRAFTS
  payload: {
    drafts: IDraft[]
  }
}

type Action = StoreDraftAction | ModifyDraftAction | SetInitialDraftsAction

export interface IDraftsState {
  initalDraftsLoaded: boolean
  drafts: IDraft[]
}

const initialState = {
  initalDraftsLoaded: false,
  drafts: []
}

export function createDraft() {
  return { id: Date.now(), data: {} }
}

export function storeDraft(draft: IDraft): StoreDraftAction {
  return { type: STORE_DRAFT, payload: { draft } }
}

export function modifyDraft(draft: IDraft) {
  return { type: MODIFY_DRAFT, payload: { draft } }
}

export function setInitialDrafts(drafts: IDraftsState) {
  return { type: SET_INITIAL_DRAFTS, payload: { drafts } }
}

export function draftsReducerTMP(
  state: IDraftsState = initialState,
  action: Action | NavigationAction
) {
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
      return {
        ...state,
        drafts: state.drafts.concat(action.payload.draft)
      }
    case MODIFY_DRAFT:
      return {
        ...state,
        drafts: state.drafts.map(draft => {
          if (draft.id === action.payload.draft.id) {
            return action.payload.draft
          }
          return draft
        })
      }
    case SET_INITIAL_DRAFTS:
      return {
        ...state,
        initalDraftsLoaded: true,
        drafts: action.payload.drafts
      }

    default:
      return state
  }
}

/*
 * Should be done as a redux-loop side effect
 */

export function draftsReducer(
  state: IDraftsState = initialState,
  action: Action
) {
  const stateOrLoop = draftsReducerTMP(state, action)
  const model = getModel(stateOrLoop)
  if (state.initalDraftsLoaded && model.drafts) {
    storage.setItem('tmp', JSON.stringify(model.drafts))
  }
  return stateOrLoop
}
