import { IStoreState } from '@opencrvs/register/src/store'
import { IReviewState } from '@opencrvs/register/src/review/reducer'

const getPartialState = (store: IStoreState): IReviewState => store.review

function getKey<K extends keyof IReviewState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getRejectForm = (store: IStoreState): IReviewState['rejectForm'] =>
  getKey(store, 'rejectForm')
