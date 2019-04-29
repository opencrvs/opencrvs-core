import { IStoreState } from '/store'
import { IRejectState } from '/review/reducer'

const getPartialState = (store: IStoreState): IRejectState => store.reject

function getKey<K extends keyof IRejectState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getRejectForm = (store: IStoreState): IRejectState['rejectForm'] =>
  getKey(store, 'rejectForm')
