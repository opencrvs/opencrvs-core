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

export const ADVANCED_SEARCH_PARAM_FIELDS = gql`
  fragment AdvancedSeachParameters on AdvancedSeachParameters {
    event
    name
    registrationStatuses
    dateOfEvent
    dateOfEventStart
    dateOfEventEnd
    contactNumber
    nationalId
    registrationNumber
    trackingId
    dateOfRegistration
    dateOfRegistrationStart
    dateOfRegistrationEnd
    declarationLocationId
    declarationJurisdictionId
    eventLocationId
    eventCountry
    eventLocationLevel1
    eventLocationLevel2
    eventLocationLevel3
    eventLocationLevel4
    eventLocationLevel5
    childFirstNames
    childLastName
    childDoB
    childDoBStart
    childDoBEnd
    childGender
    deceasedFirstNames
    deceasedFamilyName
    deceasedGender
    deceasedDoB
    deceasedDoBStart
    deceasedDoBEnd
    deceasedIdentifier
    motherFirstNames
    motherFamilyName
    motherDoB
    motherDoBStart
    motherDoBEnd
    motherIdentifier
    fatherFirstNames
    fatherFamilyName
    fatherDoB
    fatherDoBStart
    fatherDoBEnd
    fatherIdentifier
    informantFirstNames
    informantFamilyName
    informantDoB
    informantDoBStart
    informantDoBEnd
    informantIdentifier
    compositionType
  }
`

export const BOOKMARK_ADVANCED_SEARCH_RESULT_MUTATION = gql`
  ${ADVANCED_SEARCH_PARAM_FIELDS}
  mutation bookmarkAdvancedSearch($bookmarkSearchInput: BookmarkSearchInput!) {
    bookmarkAdvancedSearch(bookmarkSearchInput: $bookmarkSearchInput) {
      searchList {
        searchId
        name
        parameters {
          ...AdvancedSeachParameters
        }
      }
    }
  }
`
export const REMOVE_ADVANCED_SEARCH_RESULT_BOOKMARK_MUTATION = gql`
  ${ADVANCED_SEARCH_PARAM_FIELDS}
  mutation removeBookmarkedAdvancedSearch(
    $removeBookmarkedSearchInput: RemoveBookmarkedSeachInput!
  ) {
    removeBookmarkedAdvancedSearch(
      removeBookmarkedSearchInput: $removeBookmarkedSearchInput
    ) {
      searchList {
        searchId
        name
        parameters {
          ...AdvancedSeachParameters
        }
      }
    }
  }
`
