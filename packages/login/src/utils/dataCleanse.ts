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

import { allCountries } from '@login/utils/countryUtils'

export const convertToMSISDN = (phone: string) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */
  const countryCode =
    window.config.COUNTRY.toUpperCase() === 'FAR'
      ? 'ZMB'
      : window.config.COUNTRY.toUpperCase()

  const defaultCountryZambia = allCountries[allCountries.length - 3]
  const data =
    allCountries.find(
      (countryData) => countryData.iso2 === countryCode.slice(0, 2)
    ) || defaultCountryZambia

  if (
    phone.startsWith(data.dialCode) ||
    `+${phone}`.startsWith(data.dialCode)
  ) {
    return phone.startsWith('+') ? phone : `+${phone}`
  }
  return phone.startsWith('0')
    ? `${data.dialCode}${phone.substring(1)}`
    : `${data.dialCode}${phone}`
}
