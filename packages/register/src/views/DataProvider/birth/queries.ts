import gql from 'graphql-tag'
import { Action } from 'src/forms'

export const GET_BIRTH_REGISTRATION = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
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
        multipleBirth
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
        }
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      placeOfBirth {
        address {
          type
          line
          district
          state
          postalCode
          country
        }
      }
      birthLocation
      birthLocationType
      presentAtBirthRegistration
    }
  }
`
export function getBirthQueryMappings(action: Action) {
  switch (action) {
    case Action.LOAD_APPLICATION:
      return {
        query: GET_BIRTH_REGISTRATION,
        dataKey: 'fetchBirthRegistration'
      }
    default:
      return null
  }
}
