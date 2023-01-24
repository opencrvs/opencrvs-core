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

import { gql } from '@apollo/client'

export const FETCH_VIEW_RECORD_BY_COMPOSITION = gql`
  query fetchViewRecordByComposition($id: ID!) {
    fetchRegistrationForViewing(id: $id) {
      __typename
      id
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        duplicates
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
        mosipAid
      }
      history {
        date
        action
        regStatus
        dhis2Notification
        statusReason {
          text
        }
        reason
        location {
          id
          name
        }
        office {
          id
          name
        }
        user {
          id
          role
          systemRole
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
        signature {
          data
          type
        }
        comments {
          user {
            id
            username
            avatar {
              data
              type
            }
          }
          comment
          createdAt
        }
        input {
          valueCode
          valueId
          valueString
        }
        output {
          valueCode
          valueId
          valueString
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
            individual {
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
          }
        }
      }
      ... on BirthRegistration {
        _fhirIDMap
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
            occupation
            nationality
            birthDate
            ageOfIndividualInYears
            exactDateOfBirthUnknown
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
        mother {
          id
          name {
            use
            firstNames
            familyName
          }
          multipleBirth
          birthDate
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          maritalStatus
          occupation
          detailsExist
          reasonNotApplying
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
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          maritalStatus
          occupation
          detailsExist
          reasonNotApplying
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
        attendantAtBirth
        weightAtBirth
        birthType
        eventLocation {
          id
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
        questionnaire {
          fieldId
          value
        }
      }
      ... on DeathRegistration {
        _fhirIDMap
        deceased {
          id
          name {
            use
            firstNames
            familyName
          }
          birthDate
          age
          ageOfIndividualInYears
          exactDateOfBirthUnknown
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
            ageOfIndividualInYears
            exactDateOfBirthUnknown
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
        questionnaire {
          fieldId
          value
        }
        mannerOfDeath
        causeOfDeathEstablished
        causeOfDeathMethod
        causeOfDeath
        deathDescription
        maleDependentsOfDeceased
        femaleDependentsOfDeceased
      }
    }
  }
`
