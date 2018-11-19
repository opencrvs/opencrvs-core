import { IReviewFormState } from './reviewReducer'
import { IStoreState } from '../../store'

const getPartialState = (store: IStoreState): IReviewFormState =>
  store.reviewForm

function getKey<K extends keyof IReviewFormState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getReviewForm = (
  store: IStoreState
): IReviewFormState['reviewForm'] => getKey(store, 'reviewForm')
