/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { gql } from '@apollo/client'
import { client } from '@client/utils/apolloClient'
import { FetchViewRecordByCompositionQuery } from '@client/utils/gateway'

export const FETCH_VIEW_RECORD_BY_COMPOSITION = gql`
  query fetchViewRecordByComposition($id: ID!) {
    fetchRegistrationForViewing(id: $id) @persist {
      __typename
      id
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        contactEmail
        duplicates {
          compositionId
          trackingId
        }
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
            partOf
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
        ipAddress
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
          role {
            _id
          }
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
          value
        }
        output {
          valueCode
          valueId
          value
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
            name {
              use
              firstNames
              middleName
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
      ... on BirthRegistration {
        _fhirIDMap
        child {
          id
          name {
            use
            firstNames
            middleName
            familyName
          }
          birthDate
          gender
        }
        informant {
          id
          relationship
          otherRelationship
          _fhirIDPatient
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            middleName
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
        mother {
          id
          name {
            use
            firstNames
            middleName
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
            middleName
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
            middleName
            familyName
          }
          birthDate
          age
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          gender
          maritalStatus
          occupation
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
          _fhirIDPatient
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            middleName
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
        father {
          id
          name {
            use
            firstNames
            middleName
            familyName
          }
          birthDate
          maritalStatus
          occupation
          detailsExist
          reasonNotApplying
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          dateOfMarriage
          educationalAttainment
          nationality
          identifier {
            id
            type
            otherType
            fieldsModifiedByIdentity
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
        mother {
          id
          name {
            use
            firstNames
            middleName
            familyName
          }
          birthDate
          maritalStatus
          occupation
          detailsExist
          reasonNotApplying
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          dateOfMarriage
          educationalAttainment
          nationality
          identifier {
            id
            type
            otherType
            fieldsModifiedByIdentity
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
        spouse {
          id
          name {
            use
            firstNames
            middleName
            familyName
          }
          birthDate
          maritalStatus
          occupation
          detailsExist
          reasonNotApplying
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          dateOfMarriage
          educationalAttainment
          nationality
          identifier {
            id
            type
            otherType
            fieldsModifiedByIdentity
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
      ... on MarriageRegistration {
        _fhirIDMap
        id
        informant {
          id
          relationship
          otherRelationship
          _fhirIDPatient
          identifier {
            id
            type
            otherType
            fieldsModifiedByIdentity
          }
          name {
            use
            firstNames
            middleName
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
        bride {
          id
          name {
            use
            firstNames
            middleName
            familyName
            marriedLastName
          }
          birthDate
          maritalStatus
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          dateOfMarriage
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
        groom {
          id
          name {
            use
            firstNames
            middleName
            familyName
            marriedLastName
          }
          birthDate
          maritalStatus
          ageOfIndividualInYears
          exactDateOfBirthUnknown
          dateOfMarriage
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
        witnessOne {
          id
          relationship
          otherRelationship
          _fhirIDPatient
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            middleName
            familyName
          }
        }
        witnessTwo {
          id
          relationship
          otherRelationship
          _fhirIDPatient
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            middleName
            familyName
          }
        }
        typeOfMarriage
        eventLocation {
          id
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
    }
  }
`

async function fetchDuplicateDeclarations(id: string) {
  return (
    client &&
    client.query<FetchViewRecordByCompositionQuery>({
      query: FETCH_VIEW_RECORD_BY_COMPOSITION,
      variables: { id },
      fetchPolicy: 'network-only'
    })
  )
}

async function fetchDeclarationForViewing(id: string) {
  return (
    client &&
    client.query({
      query: FETCH_VIEW_RECORD_BY_COMPOSITION,
      variables: { id },
      fetchPolicy: 'cache-first'
    })
  )
}

export const ViewRecordQueries = {
  fetchDuplicateDeclarations,
  fetchDeclarationForViewing
}
