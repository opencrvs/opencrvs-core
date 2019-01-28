import { IMyRecordsState } from './reducer'
import { IStoreState } from '../store'

export const getOfflineState = (store: IStoreState): IMyRecordsState =>
  store.records

function getKey<K extends keyof IMyRecordsState>(store: IStoreState, key: K) {
  return getOfflineState(store)[key]
}

export const getMyRecordsDataLoaded = (
  store: IStoreState
): IMyRecordsState['myRecordsLoaded'] => getKey(store, 'myRecordsLoaded')
