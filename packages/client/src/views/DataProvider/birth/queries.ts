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

const GET_BIRTH_REGISTRATION_FOR_REVIEW = gql`
  query fetchBirthRegistrationForReview($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
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
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        contactEmail
        assignment {
          practitionerId
          firstName
          lastName
          officeName
          avatarURL
          createdAt
        }
        certificates {
          hasShowedVerifiedDocument
          certificateTemplateId
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
        duplicates {
          compositionId
          trackingId
        }
        informantsSignature
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
      history {
        otherReason
        requester
        requesterOther
        noSupportingDocumentationRequired
        hasShowedVerifiedDocument
        certificateTemplateId
        date
        action
        regStatus
        dhis2Notification
        ipAddress
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
            id
            label {
              id
              defaultMessage
              description
            }
          }
          primaryOffice {
            id
          }
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
          certificateTemplateId
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
          certifier {
            name {
              use
              firstNames
              familyName
            }
            role {
              id
              label {
                id
                defaultMessage
                description
              }
            }
          }
        }
        duplicateOf
        potentialDuplicates
      }
    }
  }
`

export const GET_BIRTH_REGISTRATION_FOR_CERTIFICATE = gql`
  query fetchBirthRegistrationForCertificate($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        multipleBirth
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
        birthDate
        gender
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
        dateOfMarriage
        educationalAttainment
        nationality
        occupation
        detailsExist
        reasonNotApplying
        ageOfIndividualInYears
        exactDateOfBirthUnknown
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
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        occupation
        detailsExist
        reasonNotApplying
        ageOfIndividualInYears
        exactDateOfBirthUnknown
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
      registration {
        id
        informantType
        otherInformantType
        contact
        contactPhoneNumber
        contactEmail
        informantsSignature
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
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      questionnaire {
        fieldId
        value
      }
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
        otherReason
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
            id
            label {
              id
              defaultMessage
              description
            }
          }
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
          certificateTemplateId
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
          certifier {
            name {
              use
              firstNames
              familyName
            }
            role {
              id
              label {
                id
                defaultMessage
                description
              }
            }
          }
        }
        duplicateOf
        potentialDuplicates
      }
    }
  }
`
export function getBirthQueryMappings(action: Action) {
  switch (action) {
    case DownloadAction.LOAD_REVIEW_DECLARATION:
      return {
        query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchBirthRegistration'
      }
    case DownloadAction.LOAD_CERTIFICATE_DECLARATION:
      return {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        dataKey: 'fetchBirthRegistration'
      }
    case DownloadAction.LOAD_REQUESTED_CORRECTION_DECLARATION:
      // TODO: Apply seperate query; currently using it
      // because the actual query is yet to be developed
      return {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        dataKey: 'fetchBirthRegistration'
      }
    default:
      return null
  }
}
