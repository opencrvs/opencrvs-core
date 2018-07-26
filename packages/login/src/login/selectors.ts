import { LoginState } from './reducer'
import { IStoreState } from '../store'
import { FormStateMap } from 'redux-form'

const getPartialState = (store: IStoreState): LoginState => store.login
const getPartialFormState = (store: IStoreState): FormStateMap => store.form

function getKey<K extends keyof LoginState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

function getFormKey<K extends keyof FormStateMap>(store: IStoreState, key: K) {
  return getPartialFormState(store)[key]
}

export const getSubmissionError = (
  store: IStoreState
): LoginState['submissionError'] => getKey(store, 'submissionError')

export const getResentSMS = (store: IStoreState): LoginState['resentSMS'] =>
  getKey(store, 'resentSMS')

export const getStepSubmitting = (
  store: IStoreState
): LoginState['stepSubmitting'] => getKey(store, 'stepSubmitting')

export const getStepTwoFormState = (
  store: IStoreState
): FormStateMap['STEP_TWO'] => getFormKey(store, 'STEP_TWO')
