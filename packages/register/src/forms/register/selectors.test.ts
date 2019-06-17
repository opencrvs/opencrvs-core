import { getReviewForm } from '@register/forms/register/review-selectors'
import { createStore } from '@opencrvs/register/src/store'

describe('when user in review form review tab should be there', () => {
  const { store } = createStore()
  it('renders the page', () => {
    const reviewForm = getReviewForm(store.getState())

    const activeSection = reviewForm.birth.sections.find(
      ({ id }: any) => id === 'review'
    )
    expect(activeSection && activeSection.id).toEqual('review')
  })
})
