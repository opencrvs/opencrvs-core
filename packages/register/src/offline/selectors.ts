import { IOfflineDataState } from './reducer'
import { IStoreState } from '../store'

const getPartialState = (store: IStoreState): IOfflineDataState => store.offline

function getKey<K extends keyof IOfflineDataState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getOfflineDataLoaded = (
  store: IStoreState
): IOfflineDataState['offlineDataLoaded'] => getKey(store, 'offlineDataLoaded')

export const getLocations = (
  store: IStoreState
): IOfflineDataState['locations'] => getKey(store, 'locations')
