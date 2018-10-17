import { IFormData } from '../forms'
import { GO_TO_TAB, Action as NavigationAction } from 'src/navigation'
import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'

const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'

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

type Action = StoreDraftAction | ModifyDraftAction

export interface IDraftsState {
  drafts: IDraft[]
}

const initialState = {
  drafts: JSON.parse(window.localStorage.getItem('tmp') || '[]')
}

export function createDraft() {
  return { id: Date.now(), data: {} }
}

export function storeDraft(draft: IDraft): StoreDraftAction {
  return { type: STORE_DRAFT, payload: { draft } }
}

export function modifyDraft(draft: IDraft): ModifyDraftAction {
  return { type: MODIFY_DRAFT, payload: { draft } }
}

export const draftsReducer: LoopReducer<IDraftsState, Action> = (
  state: IDraftsState = initialState,
  action: Action | NavigationAction
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

    default:
      return state
  }
}
