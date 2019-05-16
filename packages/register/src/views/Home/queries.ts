import gql from 'graphql-tag'

export const FETCH_REGISTRATION_BY_COMPOSITION = gql`
  query data($id: ID!) {
    fetchRegistration(id: $id) {
      id
      registration {
        id
        type
        status {
          id
          user {
            id
            name {
              use
              firstNames
              familyName
            }
            role
          }
          location {
            id
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
          type
          timestamp
          comments {
            comment
          }
        }
        contactPhoneNumber
        trackingId
      }
      ... on BirthRegistration {
        child {
          name {
            use
            firstNames
            familyName
          }
        }
      }
      ... on DeathRegistration {
        deceased {
          name {
            use
            firstNames
            familyName
          }
        }
        informant {
          individual {
            telecom {
              use
              system
              value
            }
          }
        }
      }
    }
  }
`
