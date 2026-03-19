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
import { countryMessages as messages } from '@client/i18n/messages'
import { MessageDescriptor } from 'react-intl'

type CountryItem = { value: string; label: MessageDescriptor }

export const countries = [
  /*
   * Include imaginary Farajaland country to country lists for demo environments
   */
  window.config.COUNTRY === 'FAR' ? { value: 'FAR', label: messages.FAR } : null
  // Remove potentially null country values (Farajaland)
].filter((country): country is CountryItem => Boolean(country))
