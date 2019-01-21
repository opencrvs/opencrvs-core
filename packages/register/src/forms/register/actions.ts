export const enum EVENT {
  BIRTH,
  DEATH
}

export const GET_REGISTER_FORM = 'REGISTER_FORM/GET_REGISTER_FORM'
export type GetRegisterFormAction = {
  type: typeof GET_REGISTER_FORM
}

export const GET_DEATH_REGISTER_FORM = 'REGISTER_FORM/GET_DEATH_REGISTER_FORM'
export type GetDeathRegisterFormAction = {
  type: typeof GET_DEATH_REGISTER_FORM
}

export const SET_ACTIVE_EVENT = 'REGISTER_FORM/SET_ACTIVE_EVENT'
export type SetActiveEventAction = {
  type: typeof SET_ACTIVE_EVENT
  payload: {
    event: EVENT
  }
}

export const setActiveEvent = (event: EVENT): SetActiveEventAction => ({
  type: SET_ACTIVE_EVENT,
  payload: { event }
})
