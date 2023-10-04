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

export const SEARCH_EVENTS = gql`
  query searchEvents(
    $advancedSearchParameters: AdvancedSearchParametersInput!
    $sort: String
    $count: Int
    $skip: Int
  ) {
    searchEvents(
      advancedSearchParameters: $advancedSearchParameters
      sort: $sort
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        id
        type
        registration {
          status
          contactNumber
          trackingId
          registrationNumber
          registeredLocationId
          duplicates
          assignment {
            userId
            firstName
            lastName
            officeName
            avatarURL
          }
          createdAt
          modifiedAt
        }
        operationHistories {
          operationType
          operatedOn
          operatorRole
          operatorName {
            firstNames
            familyName
            use
          }
          operatorOfficeName
          operatorOfficeAlias
          notificationFacilityName
          notificationFacilityAlias
          rejectReason
          rejectComment
        }
        ... on BirthEventSearchSet {
          dateOfBirth
          childName {
            firstNames
            familyName
            use
          }
        }
        ... on DeathEventSearchSet {
          dateOfDeath
          deceasedName {
            firstNames
            familyName
            use
          }
        }
        ... on MarriageEventSearchSet {
          dateOfMarriage
          brideName {
            firstNames
            familyName
            use
          }
          groomName {
            firstNames
            familyName
            use
          }
        }
      }
    }
  }
`
