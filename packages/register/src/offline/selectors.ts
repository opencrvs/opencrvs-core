import { IOfflineDataState, IOfflineData } from '@register/offline/reducer'
import { IStoreState } from '@register/store'

export const getOfflineState = (store: IStoreState): IOfflineDataState =>
  store.offline

function getKey<K extends keyof IOfflineDataState>(store: IStoreState, key: K) {
  return getOfflineState(store)[key]
}

export function isOfflineDataLoaded(
  state: Partial<IOfflineData>
): state is IOfflineData {
  const hasAllRequiredData =
    state.locations && state.facilities && state.forms && state.languages

  return Boolean(hasAllRequiredData)
}

export const getOfflineDataLoaded = (
  store: IStoreState
): IOfflineDataState['offlineDataLoaded'] => getKey(store, 'offlineDataLoaded')

export const getOfflineData = (store: IStoreState): IOfflineData => {
  const data = getKey(store, 'offlineData')
  if (!isOfflineDataLoaded(data)) {
    throw new Error('Offline data is not yet loaded. This should never happen')
  }
  return data
}

export const getOfflineLoadingError = (
  store: IStoreState
): IOfflineDataState['loadingError'] => getKey(store, 'loadingError')
