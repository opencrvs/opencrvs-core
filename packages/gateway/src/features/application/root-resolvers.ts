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
  GQLBirthInput,
  GQLCurrencyInput,
  GQLDeathInput,
  GQLCountryLogoInput,
  GQLResolver
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { hasScope } from '@gateway/features/user/utils'
import { IApplicationConfigPayload } from '@gateway/features/application/type-resolvers'

export const resolvers: GQLResolver = {
  Mutation: {
    async updateApplicationConfig(_, { applicationConfig = {} }, authHeader) {
      // Only natlsysadmin should be able to update application config
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Update application config is only allowed for natlsysadmin'
          )
        )
      }
      const applicationConfigPayload: IApplicationConfigPayload = {
        APPLICATION_NAME: applicationConfig.APPLICATION_NAME as string,
        COUNTRY_LOGO: applicationConfig.COUNTRY_LOGO as GQLCountryLogoInput,
        CURRENCY: applicationConfig.CURRENCY as GQLCurrencyInput,
        BIRTH: applicationConfig.BIRTH as GQLBirthInput,
        DEATH: applicationConfig.DEATH as GQLDeathInput,
        FIELD_AGENT_AUDIT_LOCATIONS:
          applicationConfig.FIELD_AGENT_AUDIT_LOCATIONS as string,
        HIDE_EVENT_REGISTER_INFORMATION:
          applicationConfig.HIDE_EVENT_REGISTER_INFORMATION as boolean,
        EXTERNAL_VALIDATION_WORKQUEUE:
          applicationConfig.EXTERNAL_VALIDATION_WORKQUEUE as boolean,
        PHONE_NUMBER_PATTERN: applicationConfig.PHONE_NUMBER_PATTERN as string,
        NID_NUMBER_PATTERN: applicationConfig.NID_NUMBER_PATTERN as string,
        ADDRESSES: applicationConfig.ADDRESSES as number
      }

      const res = await fetch(
        `${APPLICATION_CONFIG_URL}updateApplicationConfig`,
        {
          method: 'POST',
          body: JSON.stringify(applicationConfigPayload),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't update application config`
          )
        )
      }
      return await res.json()
    }
  }
}
