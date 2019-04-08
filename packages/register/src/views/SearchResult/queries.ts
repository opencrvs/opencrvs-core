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

export const FETCH_REGISTRATION_QUERY = gql`
  query list($locationIds: [String], $count: Int, $skip: Int) {
    listEventRegistrations(
      locationIds: $locationIds
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        id
        registration {
          id
          trackingId
          registrationNumber
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
          duplicates
        }
        createdAt
        ... on BirthRegistration {
          child {
            id
            name {
              use
              firstNames
              familyName
            }
            birthDate
          }
        }
        ... on DeathRegistration {
          deceased {
            id
            name {
              use
              firstNames
              familyName
            }
            birthDate
            deceased {
              deathDate
            }
          }
        }
      }
    }
  }
`
