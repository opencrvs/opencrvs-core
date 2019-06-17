import { LoginState } from '@login/login/reducer'
import { IStoreState } from '@login/store'
const getPartialState = (store: IStoreState): LoginState => store.login

function getKey<K extends keyof LoginState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}
export const getSubmissionError = (
  store: IStoreState
): LoginState['submissionError'] => getKey(store, 'submissionError')

export const getErrorCode = (store: IStoreState): LoginState['errorCode'] =>
  getKey(store, 'errorCode')

export const getResentSMS = (store: IStoreState): LoginState['resentSMS'] =>
  getKey(store, 'resentSMS')

export const getsubmitting = (store: IStoreState): LoginState['submitting'] =>
  getKey(store, 'submitting')
