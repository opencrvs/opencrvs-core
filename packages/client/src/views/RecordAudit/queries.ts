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

export const FETCH_DECLARATION_SHORT_INFO = gql`
  query fetchDeclarationShortInfo($id: ID!) {
    fetchRegistration(id: $id) {
      id
      registration {
        id
        type
        trackingId
        status {
          type
        }
        duplicates {
          compositionId
          trackingId
        }
        assignment {
          userId
          firstName
          lastName
          officeName
          avatarURL
        }
      }
      ... on BirthRegistration {
        child {
          id
          name {
            use
            firstNames
            familyName
          }
        }
      }
      ... on DeathRegistration {
        deceased {
          id
          name {
            use
            firstNames
            familyName
          }
        }
      }
      ... on MarriageRegistration {
        bride {
          id
          name {
            use
            firstNames
            familyName
          }
        }
        groom {
          id
          name {
            use
            firstNames
            familyName
          }
        }
      }
    }
  }
`
