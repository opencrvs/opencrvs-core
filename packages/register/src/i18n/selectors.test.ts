import { getLanguage } from '@register/i18n/selectors'
import { getInitialState } from '@register/tests/util'

describe('intl selectors', () => {
  let mockState: any

  beforeEach(async () => {
    mockState = await getInitialState()
  })
  describe('getLanguage', () => {
    it('should return language locale string', () => {
      const locale = 'en'
      expect(getLanguage(mockState)).toEqual(locale)
    })
  })
})
