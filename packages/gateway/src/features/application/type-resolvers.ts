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

import {
  GQLCurrencyInput,
  GQLBirthInput,
  GQLDeathInput,
  GQLLoginBackgroundInput,
  GQLCountryLogoInput,
  GQLMarriageInput
} from '@gateway/graphql/schema'

export interface IApplicationConfigPayload {
  APPLICATION_NAME: string
  BIRTH: GQLBirthInput
  COUNTRY_LOGO: GQLCountryLogoInput
  CURRENCY: GQLCurrencyInput
  DEATH: GQLDeathInput
  MARRIAGE: GQLMarriageInput
  FIELD_AGENT_AUDIT_LOCATIONS: string
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: string
  NID_NUMBER_PATTERN: string
  USER_NOTIFICATION_DELIVERY_METHOD: string
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: string
  DATE_OF_BIRTH_UNKNOWN: boolean
  INFORMANT_SIGNATURE: boolean
  INFORMANT_SIGNATURE_REQUIRED: boolean
  LOGIN_BACKGROUND: GQLLoginBackgroundInput
}
