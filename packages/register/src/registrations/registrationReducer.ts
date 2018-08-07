import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './registrationActions'

export type RegistrationState = {
  firstName: string
  submissionError: boolean
}

export const initialState: RegistrationState = {
  firstName: '',
  submissionError: false
}

export const registrationReducer: LoopReducer<
  RegistrationState,
  actions.Action
> = (
  state: RegistrationState = initialState,
  action: actions.Action
): RegistrationState | Loop<RegistrationState, actions.Action> => {
  switch (action.type) {
    case actions.START_SEND_REGISTRATION_DATA:
      return {
        ...state,
        firstName: action.payload.firstName
      }
    default:
      return state
  }
}
