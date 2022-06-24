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

import {
  GQLCurrencyInput,
  GQLBirthInput,
  GQLDeathInput,
  GQLCountryLogoInput
} from '@gateway/graphql/schema'

export interface IApplicationConfigPayload {
  APPLICATION_NAME: string
  BIRTH: GQLBirthInput
  COUNTRY_LOGO: GQLCountryLogoInput
  CURRENCY: GQLCurrencyInput
  DEATH: GQLDeathInput
  FIELD_AGENT_AUDIT_LOCATIONS: string
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: string
  NID_NUMBER_PATTERN: string
  ADDRESSES: number
}
