import { getAgeInDays } from '@metrics/features/registration/utils'

describe('Verify age in days conversion', () => {
  it('Return valid age in days', () => {
    Date.now = jest.fn(() => 1552380296600) // 12-03-2019
    const birthDate = '2019-02-28'

    const ageInDays = getAgeInDays(birthDate)
    expect(ageInDays).toEqual(12)
  })
})
