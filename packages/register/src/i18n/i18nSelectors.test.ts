import { getLanguage, getMessages } from './i18nSelectors'
import { getInitialState } from '../tests/util'
import { ENGLISH_STATE } from '../i18n/en'

describe('intlSelectors', () => {
  describe('getLanguage', () => {
    it('should return language locale string', () => {
      const locale = 'en'
      expect(getLanguage(getInitialState())).toEqual(locale)
    })
  })
  describe('getMessages', () => {
    it('should return messages object', () => {
      const messages = ENGLISH_STATE.messages
      expect(getMessages(getInitialState())).toEqual(messages)
    })
  })
})
