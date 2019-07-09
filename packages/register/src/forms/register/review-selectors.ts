import { IReviewFormState } from '@register/forms/register/reviewReducer'
import { IStoreState } from '@register/store'

const getPartialState = (store: IStoreState): IReviewFormState =>
  store.reviewForm

function getKey<K extends keyof IReviewFormState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getReviewForm = (
  store: IStoreState
): IReviewFormState['reviewForm'] => getKey(store, 'reviewForm')
