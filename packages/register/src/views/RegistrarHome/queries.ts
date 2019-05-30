import gql from 'graphql-tag'

export const COUNT_REGISTRATION_QUERY = gql`
  query data($locationIds: [String]) {
    countEventRegistrations(locationIds: $locationIds) {
      declared
      rejected
      registered
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
          registrationNumber
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
