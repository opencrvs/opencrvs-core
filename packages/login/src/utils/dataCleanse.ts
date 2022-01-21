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

export const convertToMSISDN = (
  localPhoneNumber: string,
  country: string
) => {
  /*
  *  If country is the fictional demo country (Farajaland), use Zambian number format
  */
  const countryCode = country.toUpperCase() === 'FAR' ? 'ZMB' : country.toUpperCase()

  return `${
    callingCountries[countryCode].countryCallingCodes[0]
  }${localPhoneNumber.substring(1)}`
}

export const getMSISDNCountryCode = (countryCode: string) => {
  return callingCountries[countryCode.toUpperCase()].countryCallingCodes[0]
}
