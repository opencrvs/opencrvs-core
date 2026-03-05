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

interface Window {
  config: {
    APPLICATION_NAME: string
    COUNTRY: string
    COUNTRY_LOGO: {
      fileName: string
      file: string
    }
    CURRENCY: {
      isoCode: string
      languagesAndCountry: string[]
    }
    FEATURES: {
      V2_EVENTS: boolean
    }
    REGISTER_BACKGROUND: {
      backgroundColor?: string
      backgroundImage?: string
      imageFit?: string
    }
    LANGUAGES: string[]
    MINIO_URL: string
    MINIO_BASE_URL: string // URL without path/bucket information, used for file uploads, v2
    MINIO_BUCKET: string
    SHOW_FARAJALAND_IN_COUNTRY_LISTS: boolean
    USER_NOTIFICATION_DELIVERY_METHOD: 'sms' | 'email'
    INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms' | 'email'
    PHONE_NUMBER_PATTERN: RegExp
    SENTRY: string
    DASHBOARDS: Array<{
      id: string
      title: {
        id: string
        defaultMessage: string
        description: string
      }
      url: string
    }>
    SYSTEM_IANA_TIMEZONE: string
  }
  __localeId__: string
  __WB_MANIFEST: Array<{ url: string; revision: string }>
}
