import { getAgeInDays } from '@metrics/features/registration/utils'

describe('Verify age in days conversion', () => {
  it('Return valid age in days', () => {
    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')
    const birthDate = '2019-02-28'

    const ageInDays = getAgeInDays(birthDate)
    expect(ageInDays).toEqual(12)
  })
})
