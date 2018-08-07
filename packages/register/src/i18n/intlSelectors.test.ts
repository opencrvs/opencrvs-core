import { getLanguage, getMessages } from './intlSelectors'
import { mockState } from '../tests/util'
import { ENGLISH_STATE } from '../i18n/en'

describe('intlSelectors', () => {
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
