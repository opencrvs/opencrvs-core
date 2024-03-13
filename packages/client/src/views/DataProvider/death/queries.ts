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
import { Action, DownloadAction } from '@client/forms'

export const GET_DEATH_REGISTRATION_FOR_REVIEW = gql`
  query fetchDeathRegistrationForReview($id: ID!) {
    fetchDeathRegistration(id: $id) {
      _fhirIDMap
      id
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
      registration {
        id
        contact
        informantType
        otherInformantType
        contactRelationship
        contactPhoneNumber
        contactEmail
        duplicates {
          compositionId
          trackingId
        }
        informantsSignature
        informantsSignatureURI
        attachments {
          data
          uri
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
      history {
        documents {
          id
          data
          uri
          type
        }
        payment {
          id
          type
          amount
          outcome
          date
          attachmentURL
        }
        otherReason
        requester
        hasShowedVerifiedDocument
        noSupportingDocumentationRequired
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
          alias
          address {
            state
            district
          }
        }
        system {
          name
          type
        }
        user {
          id
          role {
            _id
            labels {
              lang
              label
            }
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
              familyName
            }
            telecom {
              system
              value
              use
            }
          }
        }
        duplicateOf
        potentialDuplicates
      }
    }
  }
`

export const GET_DEATH_REGISTRATION_FOR_CERTIFICATION = gql`
  query fetchDeathRegistrationForCertification($id: ID!) {
    fetchDeathRegistration(id: $id) {
      _fhirIDMap
      id
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
      }
      mother {
        id
        name {
          use
          firstNames
          middleName
          familyName
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
      }
      medicalPractitioner {
        name
        qualification
        lastVisitDate
      }
      registration {
        id
        contact
        informantType
        otherInformantType
        contactRelationship
        contactEmail
        contactPhoneNumber
        informantsSignature
        informantsSignatureURI
        duplicates {
          compositionId
          trackingId
        }
        status {
          comments {
            comment
          }
          type
          timestamp
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
            partOf
          }
        }
        type
        trackingId
        registrationNumber
      }
      questionnaire {
        fieldId
        value
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
      mannerOfDeath
      causeOfDeathEstablished
      causeOfDeathMethod
      causeOfDeath
      deathDescription
      maleDependentsOfDeceased
      femaleDependentsOfDeceased
      history {
        otherReason
        requester
        date
        action
        regStatus
        dhis2Notification
        ipAddress
        statusReason {
          text
        }
        location {
          id
          name
        }
        office {
          id
          name
          alias
          address {
            state
            district
          }
        }
        system {
          name
          type
        }
        user {
          id
          role {
            _id
            labels {
              lang
              label
            }
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
              familyName
            }
            telecom {
              system
              value
              use
            }
          }
        }
        duplicateOf
        potentialDuplicates
      }
    }
  }
`

export function getDeathQueryMappings(action: Action) {
  switch (action) {
    case DownloadAction.LOAD_REVIEW_DECLARATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchDeathRegistration'
      }
    case DownloadAction.LOAD_CERTIFICATE_DECLARATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
        dataKey: 'fetchDeathRegistration'
      }
    case DownloadAction.LOAD_REQUESTED_CORRECTION_DECLARATION:
      // TODO: Apply seperate query; currently using it
      // because the actual query is yet to be developed
      return {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
        dataKey: 'fetchDeathRegistration'
      }
    default:
      return null
  }
}
