import { IOfflineDataState } from './reducer'
import { IStoreState } from '../store'

export const getOfflineState = (store: IStoreState): IOfflineDataState =>
  store.offline

function getKey<K extends keyof IOfflineDataState>(store: IStoreState, key: K) {
  return getOfflineState(store)[key]
}

export const getOfflineDataLoaded = (
  store: IStoreState
): IOfflineDataState['offlineDataLoaded'] => getKey(store, 'offlineDataLoaded')
