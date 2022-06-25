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
import gql from 'graphql-tag'
import { client } from '@client/utils/apolloClient'
import {
  IBirth,
  ICountryLogo,
  ICurrency,
  IDeath
} from '@client/views/SysAdmin/Config/Application/DynamicModal'

const applicationConfigMutation = gql`
  mutation updateApplicationConfig(
    $applicationConfig: ApplicationConfigurationInput
  ) {
    updateApplicationConfig(applicationConfig: $applicationConfig) {
      APPLICATION_NAME
      NID_NUMBER_PATTERN
      PHONE_NUMBER_PATTERN
      HIDE_EVENT_REGISTER_INFORMATION
      ADDRESSES
      COUNTRY_LOGO {
        fileName
        file
      }
      CURRENCY {
        languagesAndCountry
        isoCode
      }
      BIRTH {
        REGISTRATION_TARGET
        LATE_REGISTRATION_TARGET
        FEE {
          ON_TIME
          LATE
          DELAYED
        }
      }
      DEATH {
        REGISTRATION_TARGET
        FEE {
          ON_TIME
          DELAYED
        }
      }
    }
  }
`
async function mutateApplicationConfig(applicationConfig: {
  [key: string]:
    | IBirth
    | IDeath
    | ICurrency
    | ICountryLogo
    | string
    | boolean
    | number
}) {
  return (
    client &&
    client.mutate({
      mutation: applicationConfigMutation,
      variables: { applicationConfig }
    })
  )
}

export const configApplicationMutations = {
  mutateApplicationConfig
}
