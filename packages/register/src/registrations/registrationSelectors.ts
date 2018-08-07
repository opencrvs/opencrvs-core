import { RegistrationState } from './registrationReducer'
import { IStoreState } from '../store'

const getPartialState = (store: IStoreState): RegistrationState =>
  store.registration

function getKey<K extends keyof RegistrationState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getSubmissionError = (
  store: IStoreState
): RegistrationState['submissionError'] => getKey(store, 'submissionError')
