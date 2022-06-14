/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  calculateDaysFromToday,
  timeElapsed,
  getCountryTranslations
} from '@client/views/PrintCertificate/utils'

describe('calculateDays, timeElapsed tests', () => {
  it('timeElapsedInWords function returns required time duration in words', () => {
    // @ts-ignore
    Date.now = jest.fn(() => new Date('2019-01-01'))

    let days = calculateDaysFromToday('1985-08-18')

    let time = timeElapsed(days)
    expect(time.value).toBe(33)
    expect(time.unit).toBe('Year')
    days = calculateDaysFromToday('2018-12-16')
    time = timeElapsed(days)
    expect(time.value).toBe(16)
    expect(time.unit).toBe('Day')

    days = calculateDaysFromToday('2018-10-16')
    time = timeElapsed(days)
    expect(time.value).toBe(2)
    expect(time.unit).toBe('Month')
  })
  it('returns an object with available transaltions for countries', () => {
    // @ts-ignore
    const languageState = {
      en: {
        lang: 'en',
        displayName: 'English',
        messages: {
          'countries.BGD': 'Bangladesh'
        }
      },
      bn: {
        lang: 'bn',
        displayName: 'বাংলা',
        messages: {
          'countries.BGD': 'বাংলাদেশ'
        }
      },
      fr: {
        lang: 'fr',
        displayName: 'Français',
        messages: {
          'countries.BGD': 'Bangladesh'
        }
      }
    }
    const countries = [
      {
        value: 'BGD',
        label: {
          id: 'BGD',
          defaultMessage: 'Bangladesh',
          description: 'A label for Bangladesh'
        }
      }
    ]
    const availableCountries = getCountryTranslations(languageState, countries)
    expect(availableCountries).toMatchObject([
      { countries: [{ value: 'BGD', name: 'Bangladesh' }], language: 'en' },
      { countries: [{ value: 'BGD', name: 'বাংলাদেশ' }], language: 'bn' },
      { countries: [{ value: 'BGD', name: 'Bangladesh' }], language: 'fr' }
    ])
  })
})
