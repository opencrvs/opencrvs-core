import { LoginState } from './loginReducer'
import { IStoreState } from '../store'

const getPartialState = (store: IStoreState): LoginState => store.login

function getKey<K extends keyof LoginState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getSubmissionError = (
  store: IStoreState
): LoginState['submissionError'] => getKey(store, 'submissionError')
