import { LoopReducer, Loop } from 'redux-loop'
import { userSection } from './fieldDefinitions/user-section'
import { Action } from 'redux'
import { IFormSection } from '@register/forms'

const initialState: IUserFormState = {
  userForm: userSection
}

export interface IUserFormState {
  userForm: IFormSection
}

export const userFormReducer: LoopReducer<IUserFormState, Action> = (
  state: IUserFormState = initialState,
  action: Action
): IUserFormState | Loop<IUserFormState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
