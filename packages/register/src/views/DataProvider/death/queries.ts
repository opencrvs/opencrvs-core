import gql from 'graphql-tag'
import { Action } from '@register/forms'

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
          postalCode
          country
        }
      }
      informant {
        id
        relationship
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
        status {
          type
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
        status {
          comments {
            comment
          }
          type
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
    case Action.LOAD_CERTIFICATE_APPLICATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
        dataKey: 'fetchDeathRegistration'
      }
    default:
      return null
  }
}
