import { getAvailableLanguages } from './utils'
import moment from 'moment'
import './components/I18nContainer'

describe('Available languages', () => {
  it('are all defined as moment locales', () => {
    expect(getAvailableLanguages()).toEqual(moment.locales())
  })
})
