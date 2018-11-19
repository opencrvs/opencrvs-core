import { IReviewFormState } from './reviewReducer'
import { IStoreState } from '../../store'
import { IFormSection } from 'src/forms'

const getPartialState = (store: IStoreState): IReviewFormState =>
  store.reviewForm

function getKey<K extends keyof IReviewFormState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getReviewForm = (
  store: IStoreState
): IReviewFormState['reviewForm'] => getKey(store, 'reviewForm')

export const getReviewFormSection = (
  store: IStoreState,
  key: string
): IFormSection => {
  const reviewForm = getReviewForm(store)
  return reviewForm.sections.find(
    (section: IFormSection) => section.id === key
  ) as IFormSection
}
