import { LoopReducer, Loop } from 'redux-loop'
import {
  rejectRegistration,
  IRejectRegistrationForm
} from 'src/review/reject-registration'

export type IReviewState = {
  rejectForm: IRejectRegistrationForm
}

export const initialState: IReviewState = {
  rejectForm: rejectRegistration
}

const GET_REJECTION_FORM = 'REVIEW/GET_REJECTION_FORM'
type GetRejectFormAction = {
  type: typeof GET_REJECTION_FORM
}
type Action = GetRejectFormAction

export const reviewReducer: LoopReducer<IReviewState, Action> = (
  state: IReviewState = initialState,
  action: Action
): IReviewState | Loop<IReviewState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
