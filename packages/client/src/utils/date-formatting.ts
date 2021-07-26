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
import moment from 'moment'

const config: { [key: string]: moment.LocaleSpecification } = {
  en: {
    longDateFormat: {
      L: 'DD-MM-YYYY',
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      LL: 'DD MMMM YYYY',
      LLL: 'D MMMM YYYY HH:mm',
      LLLL: 'dddd D MMMM YYYY HH:mm'
    }
  },
  bn: {
    longDateFormat: {
      L: 'DD-MM-YYYY',
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      LL: 'DD MMMM YYYY',
      LLL: 'D MMMM YYYY HH:mm',
      LLLL: 'dddd D MMMM YYYY HH:mm'
    }
  }
}

export const formatLongDate = (
  date: string,
  locale: string = 'en',
  formatString: string = 'LL'
) => {
  moment.updateLocale(locale, config[locale])
  return moment(date).format(formatString)
}

export const formattedDuration = (fromDate: moment.Moment) => {
  moment.relativeTimeRounding(Math.floor)
  return fromDate.fromNow()
}
