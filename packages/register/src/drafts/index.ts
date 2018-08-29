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
  payload: { draft: IDraft }
}

type Action = StoreDraftAction | ModifyDraftAction

export interface IDraftsState {
  drafts: IDraft[]
}

const initialState = {
  drafts: []
}

export function createDraft() {
  return { id: Date.now() }
}

export function storeDraft(draft: IDraft): StoreDraftAction {
  return { type: STORE_DRAFT, payload: { draft } }
}

export function modifyDraft(draft: IDraft): ModifyDraftAction {
  return { type: MODIFY_DRAFT, payload: { draft } }
}

export function draftsReducer(
  state: IDraftsState = initialState,
  action: Action
) {
  switch (action.type) {
    case STORE_DRAFT:
      return {
        ...state,
        drafts: state.drafts.concat(action.payload.draft)
      }

    default:
      return state
  }
}
