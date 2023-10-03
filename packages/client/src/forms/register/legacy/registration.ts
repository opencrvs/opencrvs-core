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
import { ApolloQueryResult, gql } from '@apollo/client'
import {
  GQLQuery,
  GQLBirthRegistration
} from '@opencrvs/gateway/src/graphql/schema.d'

export const FETCH_REGISTRATION = gql`
  query queryRegistrationByIdentifier($identifier: ID!) {
    queryRegistrationByIdentifier(identifier: $identifier) {
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
    }
  }
`
export const transformRegistrationData = (
  response: ApolloQueryResult<GQLQuery>
) => {
  const responseData = response.data
    .queryRegistrationByIdentifier as GQLBirthRegistration
  return responseData.child
}
