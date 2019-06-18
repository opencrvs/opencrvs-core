import { IApplicationsState } from '@register/applications/index'
import { IStoreState } from '@register/store'

export const getDraftsState = (store: IStoreState): IApplicationsState =>
  store.applicationsState

function getKey<K extends keyof IApplicationsState>(
  store: IStoreState,
  key: K
) {
  return getDraftsState(store)[key]
}

export const getInitialApplicationsLoaded = (
  store: IStoreState
): IApplicationsState['initialApplicationsLoaded'] =>
  getKey(store, 'initialApplicationsLoaded')
