import { LoopReducer, Loop } from 'redux-loop'
import {
  rejectRegistration,
  IRejectRegistrationForm
} from '@register/review/reject-registration'

export type IRejectState = {
  rejectForm: IRejectRegistrationForm
}

export const initialState: IRejectState = {
  rejectForm: rejectRegistration
}

const GET_REJECTION_FORM = 'REJECT/GET_REJECTION_FORM'
type GetRejectFormAction = {
  type: typeof GET_REJECTION_FORM
}
type Action = GetRejectFormAction

export const rejectReducer: LoopReducer<IRejectState, Action> = (
  state: IRejectState = initialState,
  action: Action
): IRejectState | Loop<IRejectState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
