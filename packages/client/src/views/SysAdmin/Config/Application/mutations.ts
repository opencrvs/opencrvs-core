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
import { gql } from '@apollo/client'
import { client } from '@client/utils/apolloClient'
import { IApplicationConfig } from '@client/utils/referenceApi'

const applicationConfigMutation = gql`
  mutation updateApplicationConfig(
    $applicationConfig: ApplicationConfigurationInput
  ) {
    updateApplicationConfig(applicationConfig: $applicationConfig) {
      APPLICATION_NAME
      NID_NUMBER_PATTERN
      PHONE_NUMBER_PATTERN
      DATE_OF_BIRTH_UNKNOWN
      INFORMANT_SIGNATURE_REQUIRED
      USER_NOTIFICATION_DELIVERY_METHOD
      INFORMANT_NOTIFICATION_DELIVERY_METHOD
      LOGIN_BACKGROUND {
        backgroundColor
        backgroundImage
        imageFit
      }
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
        PRINT_IN_ADVANCE
      }
      DEATH {
        REGISTRATION_TARGET
        FEE {
          ON_TIME
          DELAYED
        }
        PRINT_IN_ADVANCE
      }
      MARRIAGE {
        REGISTRATION_TARGET
        FEE {
          ON_TIME
          DELAYED
        }
        PRINT_IN_ADVANCE
      }
    }
  }
`
async function mutateApplicationConfig(
  applicationConfig: Partial<IApplicationConfig>
) {
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
