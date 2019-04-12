import gql from 'graphql-tag'

export const FETCH_REGISTRATION_BY_COMPOSITION = gql`
  query data($id: ID!) {
    fetchRegistration(id: $id) {
      id
      registration {
        id
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

        certificates {
          collector {
            individual {
              name {
                use
                firstNames
                familyName
              }
            }
            relationship
          }
        }
      }
      ... on DeathRegistration {
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
