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

export const GET_DEATH_REGISTRATION_FOR_REVIEW = gql`
  query data($id: ID!) {
    fetchDeathRegistration(id: $id) {
      _fhirIDMap
      id
      deceased {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        age
        gender
        maritalStatus
        nationality
        identifier {
          id
          type
          otherType
        }
        gender
        deceased {
          deathDate
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
          telecom {
            system
            value
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
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
      }
      spouse {
        id
        name {
          use
          firstNames
          familyName
        }
      }
      medicalPractitioner {
        name
        qualification
        lastVisitDate
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
          type
          timestamp
        }
        type
        trackingId
        registrationNumber
      }
      eventLocation {
        id
        type
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
      mannerOfDeath
      causeOfDeath
      maleDependentsOfDeceased
      femaleDependentsOfDeceased
      history {
        date
        action
        location {
          id
          name
        }
        office {
          id
          name
        }
        user {
          type
          role
          name {
            firstNames
            familyName
            use
          }
          avatar {
            data
            type
          }
        }
      }
    }
  }
`

export const GET_DEATH_REGISTRATION_FOR_CERTIFICATION = gql`
  query data($id: ID!) {
    fetchDeathRegistration(id: $id) {
      _fhirIDMap
      id
      deceased {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        age
        gender
        maritalStatus
        nationality
        identifier {
          id
          type
          otherType
        }
        gender
        deceased {
          deathDate
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
          telecom {
            system
            value
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
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
      }
      spouse {
        id
        name {
          use
          firstNames
          familyName
        }
      }
      medicalPractitioner {
        name
        qualification
        lastVisitDate
      }
      registration {
        id
        contact
        contactRelationship
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
        type
        trackingId
        registrationNumber
      }
      eventLocation {
        id
        type
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
      mannerOfDeath
      causeOfDeathMethod
      causeOfDeath
      maleDependentsOfDeceased
      femaleDependentsOfDeceased
      history {
        date
        action
        location {
          id
          name
        }
        office {
          id
          name
        }
        user {
          type
          role
          name {
            firstNames
            familyName
            use
          }
          avatar {
            data
            type
          }
        }
      }
    }
  }
`

export function getDeathQueryMappings(action: Action) {
  switch (action) {
    case Action.LOAD_REVIEW_APPLICATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchDeathRegistration'
      }
    case Action.LOAD_CERTIFICATE_APPLICATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
        dataKey: 'fetchDeathRegistration'
      }
    default:
      return null
  }
}
