const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'

export interface IDraft {
  id: number
}

type StoreDraftAction = {
  type: typeof STORE_DRAFT
  payload: { draft: IDraft }
}

type ModifyDraftAction = {
  type: typeof MODIFY_DRAFT
  payload: { draftId: number; sectionId: string; modifiedData: any }
}

type Action = StoreDraftAction | ModifyDraftAction

export interface IDraftsState {
  drafts: IDraft[]
}

const initialState = {
  drafts: JSON.parse(window.localStorage.getItem('tmp') || '[]')
}

export function createDraft() {
  return { id: Date.now() }
}

export function storeDraft(draft: IDraft): StoreDraftAction {
  return { type: STORE_DRAFT, payload: { draft } }
}

export function modifyDraft(
  draftId: number,
  sectionId: string,
  modifiedData: any
): ModifyDraftAction {
  return { type: MODIFY_DRAFT, payload: { draftId, sectionId, modifiedData } }
}

export function draftsReducerTMP(
  state: IDraftsState = initialState,
  action: Action
) {
  switch (action.type) {
    case STORE_DRAFT:
      return {
        ...state,
        drafts: state.drafts.concat(action.payload.draft)
      }
    case MODIFY_DRAFT:
      return {
        ...state,
        drafts: state.drafts.map(draft => {
          if (draft.id === action.payload.draftId) {
            return {
              ...draft,
              [action.payload.sectionId]: action.payload.modifiedData
            }
          }
          return draft
        })
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
  const newState = draftsReducerTMP(state, action)
  window.localStorage.setItem('tmp', JSON.stringify(newState.drafts))
  return newState
}
