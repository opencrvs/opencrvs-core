import { LoopReducer, Loop } from 'redux-loop'
import { IForm } from '@register/forms'
import * as offlineActions from '@register/offline/actions'
import { deserializeForm } from '@register/forms/mappings/deserializer'

export type IRegisterFormState =
  | {
      state: 'LOADING'
      registerForm: null
    }
  | {
      state: 'READY'
      registerForm: {
        birth: IForm
        death: IForm
      }
    }

export const initialState: IRegisterFormState = {
  state: 'LOADING',
  registerForm: null
}

const GET_REGISTER_FORM = 'REGISTER_FORM/GET_REGISTER_FORM'
type GetRegisterFormAction = {
  type: typeof GET_REGISTER_FORM
}
type Action = GetRegisterFormAction

export const registerFormReducer: LoopReducer<IRegisterFormState, Action> = (
  state: IRegisterFormState = initialState,
  action: Action | offlineActions.Action
): IRegisterFormState | Loop<IRegisterFormState, Action> => {
  switch (action.type) {
    case offlineActions.READY:
      return {
        ...state,
        state: 'READY',
        registerForm: {
          birth: deserializeForm(action.payload.forms.registerForm.birth),
          death: deserializeForm(action.payload.forms.registerForm.death)
        }
      }
    default:
      return state
  }
}
