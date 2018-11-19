import { IFormData } from '../forms'
import { GO_TO_TAB, Action as NavigationAction } from 'src/navigation'
import { storage } from 'src/storage'
import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'

const SET_INITIAL_DRAFTS = 'DRAFTS/SET_INITIAL_DRAFTS'
const STORE_DRAFT = 'DRAFTS/STORE_DRAFT'
const MODIFY_DRAFT = 'DRAFTS/MODIFY_DRAFT'
const WRITE_DRAFT = 'DRAFTS/WRITE_DRAFT'
const DELETE_DRAFT = 'DRAFTS/DELETE_DRAFT'

export interface IDraft {
  id: number
  data: IFormData
}

interface IStoreDraftAction {
  type: typeof STORE_DRAFT
  payload: { draft: IDraft; isReviewForm: boolean }
}

interface IModifyDraftAction {
  type: typeof MODIFY_DRAFT
  payload: {
    draft: IDraft
    isReviewForm: boolean
  }
}

interface IWriteDraftAction {
  type: typeof WRITE_DRAFT
  payload: {
    draft: IDraftsState
    isReviewForm: boolean
  }
}

interface ISetInitialDraftsAction {
  type: typeof SET_INITIAL_DRAFTS
  payload: {
    drafts: IDraft[]
    isReviewForm: boolean
  }
}

interface IDeleteDraftAction {
  type: typeof DELETE_DRAFT
  payload: {
    draft: IDraft
    isReviewForm: boolean
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

export function storeDraft(
  draft: IDraft,
  isReviewForm: boolean = false
): IStoreDraftAction {
  return { type: STORE_DRAFT, payload: { draft, isReviewForm } }
}

export function modifyDraft(
  draft: IDraft,
  isReviewForm: boolean = false
): IModifyDraftAction {
  return { type: MODIFY_DRAFT, payload: { draft, isReviewForm } }
}
export function setInitialDrafts(
  drafts: IDraftsState,
  isReviewForm: boolean = false
) {
  return { type: SET_INITIAL_DRAFTS, payload: { drafts, isReviewForm } }
}

export function deleteDraft(
  draft: IDraft,
  isReviewForm: boolean = false
): IDeleteDraftAction {
  return { type: DELETE_DRAFT, payload: { draft, isReviewForm } }
}

function writeDraft(
  draft: IDraftsState,
  isReviewForm: boolean = false
): IWriteDraftAction {
  return { type: WRITE_DRAFT, payload: { draft, isReviewForm } }
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
        Cmd.action(
          writeDraft(stateAfterDraftStore, action.payload.isReviewForm)
        )
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
        Cmd.action(
          writeDraft(stateAfterDraftDeletion, action.payload.isReviewForm)
        )
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
        Cmd.action(
          writeDraft(stateAfterDraftModification, action.payload.isReviewForm)
        )
      )
    case WRITE_DRAFT:
      if (state.initalDraftsLoaded && state.drafts) {
        console.log(action.payload.isReviewForm)
        if (action.payload.isReviewForm) {
          storage.setItem(
            'reviewDrafts',
            JSON.stringify(action.payload.draft.drafts)
          )
        } else {
          storage.setItem('drafts', JSON.stringify(action.payload.draft.drafts))
        }
      }
      return state
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
