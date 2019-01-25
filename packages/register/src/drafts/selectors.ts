import { IDraftsState } from './index'
import { IStoreState } from '../store'

export const getDraftsState = (store: IStoreState): IDraftsState => store.drafts

function getKey<K extends keyof IDraftsState>(store: IStoreState, key: K) {
  return getDraftsState(store)[key]
}

export const getInitialDraftsLoaded = (
  store: IStoreState
): IDraftsState['initialDraftsLoaded'] => getKey(store, 'initialDraftsLoaded')
