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
    }
    CONFIG_API_URL: string
    BACKGROUND_SYNC_BROADCAST_CHANNEL: string
    COUNTRY: string
    CURRENCY: {
      isoCode: string
      languagesAndCountry: string[]
    }
    COUNTRY_LOGO_FILE: string
    COUNTRY_LOGO_RENDER_WIDTH: number // in px
    COUNTRY_LOGO_RENDER_HEIGHT: number // in px
    DESKTOP_TIME_OUT_MILLISECONDS: number
    DEATH: {
      REGISTRATION_TARGET: number
      FEE: {
        ON_TIME: number
        DELAYED: number
      }
    }
    LANGUAGES: string
    LOGIN_URL: string
    AUTH_URL: string
    COUNTRY_CONFIG_URL: string
    SHOW_FARAJALAND_IN_COUNTRY_LISTS: boolean
    CERTIFICATE_PRINT_LOWEST_CHARGE: number
    CERTIFICATE_PRINT_HIGHEST_CHARGE: number
    UI_POLLING_INTERVAL: number
    INFORMANT_MINIMUM_AGE: number
    HIDE_EVENT_REGISTER_INFORMATION: boolean
    EXTERNAL_VALIDATION_WORKQUEUE: boolean
    FIELD_AGENT_AUDIT_LOCATIONS: string
    DECLARATION_AUDIT_LOCATIONS: string
    PHONE_NUMBER_PATTERN: {
      pattern: RegExp
      example: string
      start?: string
      num: string
      mask: {
        startForm: number
        endBefore: number
      }
    }
    NID_NUMBER_PATTERN: {
      pattern: RegExp
      example: string
      num: string
    }
    LOGROCKET: string
    SENTRY: string
  }
}
