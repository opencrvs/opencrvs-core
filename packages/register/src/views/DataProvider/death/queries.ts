import gql from 'graphql-tag'
import { Action } from 'src/forms'

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
            postalCode
            country
          }
        }
      }
      registration {
        id
        attachments {
          data
          type
          contentType
          subject
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
          postalCode
          country
        }
      }
      mannerOfDeath
      causeOfDeathMethod
      causeOfDeath
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
    default:
      return null
  }
}
