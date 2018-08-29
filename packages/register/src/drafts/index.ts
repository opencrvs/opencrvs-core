const CREATE_DRAFT = 'DRAFTS/CREATE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'

interface IDraft {
  id: number
}

type CreateDraftAction = { type: typeof CREATE_DRAFT }
type ModifyDraftAction = { type: typeof MODIFY_DRAFT; payload: IDraft }

type Action = CreateDraftAction | ModifyDraftAction

export interface IDraftsState {
  drafts: IDraft[]
}

const initialState = {
  drafts: []
}

export function createDraft() {
  return { type: CREATE_DRAFT }
}

export function modifyDraft(draft: IDraft) {
  return { type: MODIFY_DRAFT, payload: draft }
}

export function draftsReducer(
  state: IDraftsState = initialState,
  action: Action
) {
  switch (action.type) {
    case CREATE_DRAFT:
      return {
        ...state,
        drafts: state.drafts.concat({ id: Date.now() })
      }
    default:
      return state
  }
}
