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

const applicationNameConfigMutation = gql`
  mutation ($applicationConfig: ApplicationConfigurationInput) {
    updateApplicationConfig(applicationConfig: $applicationConfig) {
      APPLICATION_NAME
    }
  }
`

const applicationNidPatternConfigMutation = gql`
  mutation ($applicationConfig: ApplicationConfigurationInput) {
    updateApplicationConfig(applicationConfig: $applicationConfig) {
      NID_NUMBER_PATTERN
    }
  }
`

async function updateApplicationName(applicationName: string) {
  const applicationConfig = {
    APPLICATION_NAME: applicationName
  }

  return (
    client &&
    client.mutate({
      mutation: applicationNameConfigMutation,
      variables: { applicationConfig }
    })
  )
}

async function updateNidPattern(nidPattern: string) {
  const applicationConfig = {
    NID_NUMBER_PATTERN: nidPattern
  }

  return (
    client &&
    client.mutate({
      mutation: applicationNidPatternConfigMutation,
      variables: { applicationConfig }
    })
  )
}

export const configApplicationMutations = {
  updateApplicationName,
  updateNidPattern
}
