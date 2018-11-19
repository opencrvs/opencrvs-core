import { goToBirthRegistrationForReview } from './index'

describe('when user registration form for review', () => {
  it('renders the page', () => {
    const push = goToBirthRegistrationForReview(1542088554908)
    const generatedUrl =
      push && push.payload && push.payload.args && push.payload.args[0]
    const mockUrl = '/reviews/review/1542088554908/events/birth/parent/review'

    expect(mockUrl).toEqual(generatedUrl)
  })
})
