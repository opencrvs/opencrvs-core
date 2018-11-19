import { getReviewForm } from './selectors'
import { createStore } from '../../../../register/src/store'

describe('when user in review form review tab should be there', () => {
  const { store } = createStore()
  it('renders the page', () => {
    const reviewForm = getReviewForm(store.getState())

    const activeSection = reviewForm.sections.find(({ id }) => id === 'review')
    expect(activeSection && activeSection.id).toEqual('review')
  })
})
