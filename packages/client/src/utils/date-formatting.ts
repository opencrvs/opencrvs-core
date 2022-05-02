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
import format from 'date-fns/format'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import enGB from 'date-fns/locale/en-GB'
import bn from 'date-fns/locale/bn'
import fr from 'date-fns/locale/fr'

export const locales: Record<string, Locale> = { en: enGB, bn, fr }

export const formatLongDate = (
  date: string,
  locale = 'en',
  formatString = 'dd MMMM yyyy'
) => {
  window.__localeId__ = locale
  return format(new Date(date), formatString, {
    locale: locales[window.__localeId__]
  })
}

export const formattedDuration = (fromDate: Date | number) => {
  return formatDistanceToNowStrict(fromDate, {
    locale: locales[window.__localeId__],
    addSuffix: true,
    roundingMethod: 'floor'
  })
}

export default function (date: Date | number, formatStr = 'PP') {
  return format(date, formatStr, {
    locale: locales[window.__localeId__]
  })
}
