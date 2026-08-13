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
import { countryLogo } from '@countryconfig/api/application/country-logo'
import { env } from '@countryconfig/environment'
import { defineApplicationConfig } from '@opencrvs/toolkit/application-config'

export const applicationConfig = defineApplicationConfig({
  APPLICATION_NAME: 'Farajaland CRS',
  TELEMETRY_ENABLED: true,
  TELEMETRY_DOMAIN: new URL(env.CLIENT_APP_URL).hostname || 'localhost',
  TELEMETRY_ENVIRONMENT: 'qa',
  COUNTRY_CODE: 'FAR',
  COUNTRY_LOGO: countryLogo,
  SYSTEM_IANA_TIMEZONE: 'Asia/Dhaka', // Default timezone for the country. Basis for date and time calculations during searches.
  CURRENCY: {
    languagesAndCountry: ['en-US'],
    isoCode: 'USD'
  },
  ADMIN_STRUCTURE: [
    {
      id: 'province',
      label: {
        id: 'field.address.province.label',
        defaultMessage: 'Province',
        description: 'Label for province in address'
      }
    },
    {
      id: 'district',
      label: {
        id: 'field.address.district.label',
        defaultMessage: 'District',
        description: 'Label for district in address'
      }
    },
    {
      id: 'village',
      label: {
        id: 'field.address.village.label',
        defaultMessage: 'Village',
        description: 'Label for village in address'
      }
    }
  ],
  PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
  USER_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email', // or 'sms', or '' ... You can use 'sms' for WhatsApp
  SEARCH_DEFAULT_CRITERIA: 'TRACKING_ID'
  /*
   * SEARCH_DEFAULT_CRITERIA's value can be one of the following
   * | 'TRACKING_ID',
   * | 'REGISTRATION_NUMBER',
   * | 'NATIONAL_ID',
   * | 'NAME',
   * | 'PHONE_NUMBER',
   * | 'EMAIL'
   */
})
