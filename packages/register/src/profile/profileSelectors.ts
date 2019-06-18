import { ProfileState } from '@register/profile/profileReducer'
import { IStoreState } from '@register/store'
import { Scope } from '@register/utils/authUtils'

const getPartialState = (store: IStoreState): ProfileState => store.profile

function getKey<K extends keyof ProfileState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getAuthenticated = (
  store: IStoreState
): ProfileState['authenticated'] => getKey(store, 'authenticated')

export const getTokenPayload = (
  store: IStoreState
): ProfileState['tokenPayload'] => getKey(store, 'tokenPayload')

export const getScope = (store: IStoreState): Scope | null => {
  const tokenPayload = getTokenPayload(store)
  return tokenPayload && tokenPayload.scope
}

export const getUserDetails = (
  store: IStoreState
): ProfileState['userDetails'] => getKey(store, 'userDetails')
