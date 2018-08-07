import { RouterAction } from 'react-router-redux'
import { IRegistrationData } from './RegistrationForm'

export const START_SEND_REGISTRATION_DATA =
  'REGISTRATION/START_SEND_REGISTRATION_DATA'

export type Action =
  | { type: typeof START_SEND_REGISTRATION_DATA; payload: IRegistrationData }
  | RouterAction

export const startRegistration = (values: IRegistrationData): Action => {
  return {
    type: START_SEND_REGISTRATION_DATA,
    payload: values
  }
}
