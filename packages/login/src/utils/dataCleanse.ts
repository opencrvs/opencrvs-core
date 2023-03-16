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
import { callingCountries } from 'country-data'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'

export const convertToMSISDN = (localPhoneNumber: string) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */
  const countryCode =
  window.config.COUNTRY.toUpperCase() === 'FAR'
    ? 'ZM'
    : callingCountries[window.config.COUNTRY.toUpperCase()].alpha2

  const phoneUtil = PhoneNumberUtil.getInstance()
  const number = phoneUtil.parse(localPhoneNumber, countryCode)

  return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL)

}

export const getMSISDNCountryCode = (countryCode: string) => {
  return callingCountries[countryCode.toUpperCase()].countryCallingCodes[0]
}