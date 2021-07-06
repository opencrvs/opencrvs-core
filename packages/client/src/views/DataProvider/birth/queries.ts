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
import { Action } from '@client/forms'

export const GET_BIRTH_REGISTRATION_FOR_REVIEW = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        multipleBirth
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      informant {
        id
        relationship
        otherRelationship
        individual {
          id
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            familyName
          }
          nationality
          birthDate
          address {
            type
            line
            district
            state
            city
            postalCode
            country
          }
        }
      }
      primaryCaregiver {
        parentDetailsType
        primaryCaregiver {
          name {
            use
            firstNames
            familyName
          }
          telecom {
            system
            value
            use
          }
        }
        reasonsNotApplying {
          primaryCaregiverType
          reasonNotApplying
          isDeceased
        }
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        occupation
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        occupation
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        contact
        contactRelationship
        contactPhoneNumber
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
          type
          timestamp
        }
        type
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      eventLocation {
        type
        address {
          line
          district
          state
          city
          postalCode
          country
        }
      }
      presentAtBirthRegistration
    }
  }
`

export const GET_BIRTH_REGISTRATION_FOR_CERTIFICATE = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        multipleBirth
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        occupation
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        occupation
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      informant {
        id
        relationship
        otherRelationship
        individual {
          id
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            familyName
          }
          nationality
          occupation
          birthDate
          address {
            type
            line
            district
            state
            city
            postalCode
            country
          }
        }
      }
      primaryCaregiver {
        parentDetailsType
        primaryCaregiver {
          name {
            use
            firstNames
            familyName
          }
          telecom {
            system
            value
            use
          }
        }
        reasonsNotApplying {
          primaryCaregiverType
          reasonNotApplying
          isDeceased
        }
      }
      registration {
        id
        contact
        contactPhoneNumber
        status {
          comments {
            comment
          }
          type
          timestamp
          location {
            name
            alias
          }
          office {
            name
            alias
            address {
              district
              state
            }
          }
        }
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      eventLocation {
        type
        address {
          line
          district
          state
          city
          postalCode
          country
        }
      }
      presentAtBirthRegistration
    }
  }
`
export function getBirthQueryMappings(action: Action) {
  switch (action) {
    case Action.LOAD_REVIEW_APPLICATION:
      return {
        query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchBirthRegistration'
      }
    case Action.LOAD_CERTIFICATE_APPLICATION:
      return {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        dataKey: 'fetchBirthRegistration'
      }
    default:
      return null
  }
}
