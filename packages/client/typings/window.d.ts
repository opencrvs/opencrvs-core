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
    API_GATEWAY_URL: string
    BACKGROUND_SYNC_BROADCAST_CHANNEL: string
    COUNTRY: string
    COUNTRY_LOGO_FILE: string
    DESKTOP_TIME_OUT_MILLISECONDS: number
    LANGUAGES: string
    LOGIN_URL: string
    AUTH_URL: string
    RESOURCES_URL: string
    HEALTH_FACILITY_FILTER: string
    CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: number
    CERTIFICATE_PRINT_CHARGE_UP_LIMIT: number
    CERTIFICATE_PRINT_LOWEST_CHARGE: number
    CERTIFICATE_PRINT_HIGHEST_CHARGE: number
    UI_POLLING_INTERVAL: number
    SHOW_EVENT_REGISTER_INFORMATION: boolean
    EXTERNAL_VALIDATION_WORKQUEUE: boolean
    FIELD_AGENT_AUDIT_LOCATIONS: string
    APPLICATION_AUDIT_LOCATIONS: string
    LOGROCKET: string
    SENTRY: string
  }
}
