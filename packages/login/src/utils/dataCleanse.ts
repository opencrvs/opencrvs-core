/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { callingCountries } from 'country-data'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'

export const convertToMSISDN = (phone: string, alpha3CountryCode: string) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */
  const countryCode =
    alpha3CountryCode === 'FAR'
      ? 'ZM'
      : callingCountries[alpha3CountryCode].alpha2

  const phoneUtil = PhoneNumberUtil.getInstance()
  const number = phoneUtil.parse(phone, countryCode)

  return (
    phoneUtil
      .format(number, PhoneNumberFormat.INTERNATIONAL)
      // libphonenumber adds spaces and dashes to phone numbers,
      // which we do not want to keep for now
      .replace(/[\s-]/g, '')
  )
}

export const getMSISDNCountryCode = (countryCode: string) => {
  return callingCountries[countryCode.toUpperCase()].countryCallingCodes[0]
}
