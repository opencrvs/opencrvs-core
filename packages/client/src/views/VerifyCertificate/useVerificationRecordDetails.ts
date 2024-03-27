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

import { gql, useQuery } from '@apollo/client'
import { Query } from '@client/utils/gateway'
import { useParams } from 'react-router'

const FETCH_RECORD_DETAILS_FOR_VERIFICATION = gql`
  query fetchRecordDetailsForVerification($id: String!) {
    fetchRecordDetailsForVerification(id: $id) {
      ... on BirthRegistration {
        id
        child {
          name {
            firstNames
            familyName
          }
          birthDate
          gender
        }
        eventLocation {
          id
          name
          description
          type
          address {
            district
            state
            city
            country
          }
        }
        registration {
          trackingId
          registrationNumber
          type
        }
        createdAt
        history {
          action
          regStatus
          user {
            name {
              firstNames
              familyName
            }
            catchmentArea {
              name
            }
          }
        }
      }
      ... on DeathRegistration {
        id
        deceased {
          name {
            firstNames
            familyName
          }
          birthDate
          gender
          deceased {
            deathDate
          }
        }
        eventLocation {
          id
          name
          description
          type
          address {
            district
            state
            city
            country
          }
        }
        registration {
          trackingId
          registrationNumber
          type
        }
        createdAt
        history {
          action
          regStatus
          user {
            name {
              firstNames
              familyName
            }
            catchmentArea {
              name
            }
          }
        }
      }
    }
  }
`

export const useVerificationRecordDetails = () => {
  const { declarationId } = useParams<{ declarationId: string }>()
  const {
    loading,
    error,
    data: queryData
  } = useQuery<Pick<Query, 'fetchRecordDetailsForVerification'>>(
    FETCH_RECORD_DETAILS_FOR_VERIFICATION,
    {
      variables: { id: declarationId },
      fetchPolicy: 'network-only'
    }
  )
  const data = queryData?.fetchRecordDetailsForVerification

  return { loading, error, data }
}
