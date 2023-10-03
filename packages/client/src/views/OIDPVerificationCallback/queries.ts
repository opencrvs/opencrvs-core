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

export const GET_OIDP_USER_INFO = gql`
  query getOIDPUserInfo(
    $code: String!
    $clientId: String!
    $redirectUri: String!
    $grantType: String
  ) {
    getOIDPUserInfo(
      code: $code
      clientId: $clientId
      redirectUri: $redirectUri
      grantType: $grantType
    ) {
      oidpUserInfo {
        sub
        name
        given_name
        family_name
        middle_name
        nickname
        preferred_username
        profile
        picture
        website
        email
        email_verified
        gender
        birthdate
        zoneinfo
        locale
        phone_number
        phone_number_verified
        address {
          formatted
          street_address
          locality
          region
          postal_code
          city
          country
        }
        updated_at
      }
      districtFhirId
      stateFhirId
      locationLevel3FhirId
    }
  }
`
