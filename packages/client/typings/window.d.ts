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
    API_GATEWAY_URL: string
    BIRTH: {
      REGISTRATION_TARGET: number
      LATE_REGISTRATION_TARGET: number
      FEE: {
        ON_TIME: number
        LATE: number
        DELAYED: number
      }
      PRINT_IN_ADVANCE: boolean
    }
    CONFIG_API_URL: string
    COUNTRY: string
    COUNTRY_LOGO: {
      fileName: string
      file: string
    }
    CURRENCY: {
      isoCode: string
      languagesAndCountry: string[]
    }
    DEATH: {
      REGISTRATION_TARGET: number
      FEE: {
        ON_TIME: number
        DELAYED: number
      }
      PRINT_IN_ADVANCE: boolean
    }
    MARRIAGE: {
      REGISTRATION_TARGET: number
      FEE: {
        ON_TIME: number
        DELAYED: number
      }
      PRINT_IN_ADVANCE: boolean
    }
    MARRIAGE_REGISTRATION: boolean
    LANGUAGES: string
    AVAILABLE_LANGUAGES_SELECT: string
    LOGIN_URL: string
    AUTH_URL: string
    MINIO_BUCKET: string
    COUNTRY_CONFIG_URL: string
    SHOW_FARAJALAND_IN_COUNTRY_LISTS: boolean
    USER_NOTIFICATION_DELIVERY_METHOD: 'sms' | 'email'
    INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms' | 'email'
    EXTERNAL_VALIDATION_WORKQUEUE: boolean
    FIELD_AGENT_AUDIT_LOCATIONS: string
    PHONE_NUMBER_PATTERN: RegExp
    NID_NUMBER_PATTERN: RegExp
    DECLARATION_AUDIT_LOCATIONS: string
    LOGROCKET: string
    SENTRY: string
    DATE_OF_BIRTH_UNKNOWN: boolean
    INFORMANT_SIGNATURE: boolean
    INFORMANT_SIGNATURE_REQUIRED: boolean
    REGISTRATIONS_DASHBOARD_URL: string
    STATISTICS_DASHBOARD_URL: string
    LEADERBOARDS_DASHBOARD_URL: string
  }
  __localeId__: string
  __WB_MANIFEST: Array<{ url: string; revision: string }>
}
