import { createStore } from '@opencrvs/register/src/store'
import { getReviewFormFromStore } from '@register/tests/util'
import { Event } from '@register/forms'

describe('when user in review form review tab should be there', () => {
  const { store } = createStore()
  it('renders the page', async () => {
    const birthReviewForm = await getReviewFormFromStore(store, Event.BIRTH)

    const activeSection = birthReviewForm.sections.find(
      ({ id }) => id === 'review'
    )
    expect(activeSection && activeSection.id).toEqual('review')
  })
})
