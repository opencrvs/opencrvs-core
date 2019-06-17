import { getLanguage, getMessages } from '@performance/i18n/selectors'
import { getInitialState } from '@performance/tests/util'
import { ENGLISH_STATE } from '@performance/i18n/locales/en'

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
  describe('getMessages', () => {
    it('should return messages object', () => {
      const messages = ENGLISH_STATE.messages
      expect(getMessages(mockState)).toEqual(messages)
    })
  })
})
