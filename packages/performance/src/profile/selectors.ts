import { ProfileState } from './reducer'
import { IStoreState } from 'src/store'

const getPartialState = (store: IStoreState): ProfileState => store.profile

function getKey<K extends keyof ProfileState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getAuthenticated = (
  store: IStoreState
): ProfileState['authenticated'] => getKey(store, 'authenticated')
