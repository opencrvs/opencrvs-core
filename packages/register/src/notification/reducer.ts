import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'

export type NotificationState = {
  newContentAvailable: boolean
}

export const initialState: NotificationState = {
  newContentAvailable: false
}

type Action =
  | actions.ShowNewContentAvailableAction
  | actions.HideNewContentAvailableAction

export const notificationReducer: LoopReducer<NotificationState, Action> = (
  state: NotificationState = initialState,
  action: Action
): NotificationState | Loop<NotificationState, Action> => {
  switch (action.type) {
    case actions.SHOW_NEW_CONTENT_AVAILABLE:
      return {
        ...state,
        newContentAvailable: true
      }
    case actions.HIDE_NEW_CONTENT_AVAILABLE:
      return {
        ...state,
        newContentAvailable: false
      }
    default:
      return state
  }
}
