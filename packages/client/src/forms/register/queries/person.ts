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
import { ApolloQueryResult } from 'apollo-client'
import { GQLQuery, GQLPerson } from '@opencrvs/gateway/src/graphql/schema.d'

export const FETCH_PERSON = gql`
  query fetchPerson($identifier: ID!) {
    queryPersonByIdentifier(identifier: $identifier) {
      id
      name {
        use
        firstNames
        middleNames
        familyName
      }
      birthDate
      gender
      address {
        type
        line
        city
        district
        state
        postalCode
        country
      }
    }
  }
`

export const FETCH_PERSON_NID = gql`
  query fetchPersonByNID($dob: String!, $nid: String!, $country: String) {
    queryPersonByNidIdentifier(dob: $dob, nid: $nid, country: $country) {
      name {
        use
        firstNames
        middleNames
        familyName
      }
      gender
    }
  }
`

export const transformPersonData = (response: ApolloQueryResult<GQLQuery>) => {
  const responseData = response.data.queryPersonByNidIdentifier as GQLPerson
  return responseData
}
export const transformInformantData = (
  response: ApolloQueryResult<GQLQuery>
) => {
  const responseData = response.data.queryPersonByNidIdentifier as GQLPerson
  return { individual: responseData }
}
