import gql from 'graphql-tag'

export const COUNT_REGISTRATION_QUERY = gql`
  query data($locationIds: [String]) {
    countEventRegistrations(locationIds: $locationIds) {
      declared
      rejected
    }
  }
`
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
      ... on BirthRegistration {
        child {
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
          name {
            use
            firstNames
            familyName
          }
          deceased {
            deathDate
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
export const FETCH_REGISTRATIONS_QUERY = gql`
  query data($status: String, $locationIds: [String], $count: Int, $skip: Int) {
    listEventRegistrations(
      status: $status
      locationIds: $locationIds
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        id
        registration {
          type
          trackingId
          contactPhoneNumber
          status {
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
          }
        }
        createdAt
        ... on BirthRegistration {
          child {
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
            name {
              use
              firstNames
              familyName
            }
            deceased {
              deathDate
            }
          }
          informant {
            individual {
              telecom {
                system
                value
              }
            }
          }
        }
      }
    }
  }
`
