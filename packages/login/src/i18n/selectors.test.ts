import { getLanguage, getMessages } from '@login/i18n/selectors'
import { mockState } from '@login/tests/util'
import { BENGALI_STATE } from '@login/i18n/locales/bn'

describe('intl selectors', () => {
  describe('getLanguage', () => {
    it('should return language locale string', () => {
      const locale = 'bn'
      expect(getLanguage(mockState)).toEqual(locale)
    })
  })
  describe('getMessages', () => {
    it('should return messages object', () => {
      const messages = BENGALI_STATE.messages
      expect(getMessages(mockState)).toEqual(messages)
    })
  })
})
