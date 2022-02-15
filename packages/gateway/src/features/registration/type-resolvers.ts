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
import {
  findCompositionSection,
  findExtension,
  fetchFHIR,
  getTimeLoggedFromMetrics,
  getStatusFromTask,
  getDownloadedExtensionStatus,
  ITimeLoggedResponse
} from '@gateway/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  ATTACHMENT_DOCS_CODE,
  BIRTH_ENCOUNTER_CODE,
  BODY_WEIGHT_CODE,
  BIRTH_TYPE_CODE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_REG_PRESENT_CODE,
  BIRTH_REG_TYPE_CODE,
  LAST_LIVE_BIRTH_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE,
  DECEASED_CODE,
  INFORMANT_CODE,
  DEATH_ENCOUNTER_CODE,
  MANNER_OF_DEATH_CODE,
  CAUSE_OF_DEATH_CODE,
  CAUSE_OF_DEATH_METHOD_CODE,
  CERTIFICATE_DOCS_CODE,
  PRIMARY_CAREGIVER_CODE,
  REASON_MOTHER_NOT_APPLYING,
  REASON_FATHER_NOT_APPLYING,
  REASON_CAREGIVER_NOT_APPLYING,
  PRIMARY_CAREGIVER,
  PARENT_DETAILS,
  SPOUSE_CODE,
  MALE_DEPENDENTS_ON_DECEASED_CODE,
  FEMALE_DEPENDENTS_ON_DECEASED_CODE
} from '@gateway/features/fhir/templates'
import { GQLResolver } from '@gateway/graphql/schema'
import {
  ORIGINAL_FILE_NAME_SYSTEM,
  SYSTEM_FILE_NAME_SYSTEM,
  FHIR_SPECIFICATION_URL,
  OPENCRVS_SPECIFICATION_URL
} from '@gateway/features/fhir/constants'
import { ITemplatedComposition } from '@gateway/features/registration/fhir-builders'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import * as validateUUID from 'uuid-validate'

export const typeResolvers: GQLResolver = {
  EventRegistration: {
    // tslint:disable-next-line
    __resolveType(obj) {
      if (obj.type.coding[0].code === 'birth-application') {
        return 'BirthRegistration'
      } else {
        return 'DeathRegistration'
      }
    }
  },
  HumanName: {
    firstNames(name) {
      return (name.given && name.given.join(' ')) || ''
    },
    familyName(name) {
      if (!name.family) {
        return null
      }
      return Array.isArray(name.family) ? name.family.join(' ') : name.family
    }
  },
  IdentityType: {
    id: (identifier) => {
      return identifier.value
    },
    type: (identifier) => {
      return identifier.type
    },
    otherType: (identifier) => {
      return identifier.otherType
    }
  },
  Address: {
    stateName: async (address, _, authHeader) => {
      const location = await fetchFHIR(`/Location/${address.state}`, authHeader)
      return location.name
    },
    districtName: async (address, _, authHeader) => {
      const location = await fetchFHIR(
        `/Location/${address.district}`,
        authHeader
      )
      return location.name
    },
    lineName: (address, _, authHeader) => {
      return Promise.all(
        address.line.map(async (line: string) => {
          if (!validateUUID(line)) {
            return line
          }
          const location = await fetchFHIR(`/Location/${line}`, authHeader)
          return location.name
        })
      )
    }
  },
  Person: {
    /* `gender` and `name` resolvers are trivial resolvers, so they don't need implementation */
    dateOfMarriage: (person) => {
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person.extension
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    age: (person) => {
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age`,
        person.extension
      )
      return (marriageExtension && marriageExtension.valueString) || null
    },
    maritalStatus: (person) => {
      return person && person.maritalStatus && person.maritalStatus.text
    },
    occupation: (person) => {
      const occupationExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
        person.extension
      )
      return (occupationExtension && occupationExtension.valueString) || null
    },
    multipleBirth: (person) => {
      return person.multipleBirthInteger
    },
    deceased: (person) => {
      return person
    },
    nationality: (person) => {
      const nationalityExtension = findExtension(
        `${FHIR_SPECIFICATION_URL}patient-nationality`,
        person.extension
      )
      if (!nationalityExtension || !nationalityExtension.extension) {
        return null
      }
      const countryCodeExtension = findExtension(
        'code',
        nationalityExtension.extension
      )

      const coding =
        (countryCodeExtension &&
          countryCodeExtension.valueCodeableConcept &&
          countryCodeExtension.valueCodeableConcept.coding &&
          countryCodeExtension.valueCodeableConcept.coding) ||
        []

      // Nationality could be multiple
      const nationality = coding.map((n) => {
        return n.code
      })

      return nationality
    },
    educationalAttainment: (person) => {
      const educationalAttainmentExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
        person.extension
      )
      return (
        (educationalAttainmentExtension &&
          educationalAttainmentExtension.valueString) ||
        null
      )
    }
  },
  RelatedPerson: {
    id: (relatedPerson) => {
      return relatedPerson && relatedPerson.id
    },
    relationship: (relatedPerson) => {
      return (
        relatedPerson &&
        relatedPerson.relationship &&
        relatedPerson.relationship.coding &&
        relatedPerson.relationship.coding[0].code
      )
    },
    otherRelationship: (relatedPerson) => {
      return (
        relatedPerson &&
        relatedPerson.relationship &&
        relatedPerson.relationship.text
      )
    },
    individual: async (relatedPerson, _, authHeader) => {
      if (
        !relatedPerson ||
        !relatedPerson.patient ||
        !relatedPerson.patient.reference
      ) {
        return
      }
      if (relatedPerson.patient.reference.startsWith('RelatedPerson')) {
        // tslint:disable-next-line
        relatedPerson = await fetchFHIR(
          `/${relatedPerson.patient.reference}`,
          authHeader
        )
      }
      return await fetchFHIR(`/${relatedPerson.patient.reference}`, authHeader)
    }
  },
  Deceased: {
    deceased: (person) => {
      return person && person.deceasedBoolean
    },
    deathDate: (person) => {
      return person && person.deceasedDateTime
    }
  },
  Registration: {
    async trackingId(task: fhir.Task) {
      let trackingId =
        task &&
        task.code &&
        task.code.coding &&
        task.code.coding[0] &&
        task.code.coding[0].code
      if (trackingId === 'BIRTH') {
        trackingId = 'birth-tracking-id'
      } else {
        trackingId = 'death-tracking-id'
      }
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/${trackingId}`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    async registrationNumber(task: fhir.Task) {
      let regNoType =
        task &&
        task.code &&
        task.code.coding &&
        task.code.coding[0] &&
        task.code.coding[0].code
      if (regNoType === 'BIRTH') {
        regNoType = 'birth-registration-number'
      } else {
        regNoType = 'death-registration-number'
      }
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === `${OPENCRVS_SPECIFICATION_URL}id/${regNoType}`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    async attachments(task: fhir.Task, _, authHeader) {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const composition = await fetchFHIR(
        `/${task.focus.reference}`,
        authHeader
      )
      const docSection = findCompositionSection(
        ATTACHMENT_DOCS_CODE,
        composition
      )
      if (!docSection || !docSection.entry) {
        return null
      }
      const docRefReferences = docSection.entry.map(
        (docRefEntry: fhir.Reference) => docRefEntry.reference
      )
      return docRefReferences.map(async (docRefReference: string) => {
        return await fetchFHIR(`/${docRefReference}`, authHeader)
      })
    },
    contact: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    contactRelationship: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-relationship`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    contactPhoneNumber: (task) => {
      const contactNumber = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
        task.extension
      )
      return (contactNumber && contactNumber.valueString) || null
    },
    paperFormID: (task) => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-id`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    page: (task) => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-page`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    book: (task) => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-book`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    status: async (task: fhir.Task, _, authHeader) => {
      // fetch full task history
      const taskBundle: fhir.Bundle = await fetchFHIR(
        `/Task/${task.id}/_history`,
        authHeader
      )
      return (
        taskBundle.entry &&
        taskBundle.entry.map((taskEntry: fhir.BundleEntry, i) => {
          const historicalTask = taskEntry.resource
          // all these tasks will have the same id, make it more specific to keep apollo-client's cache happy
          if (historicalTask && historicalTask.meta) {
            historicalTask.id = `${historicalTask.id}/_history/${historicalTask.meta.versionId}`
          }
          return historicalTask
        })
      )
    },
    type: (task) => {
      const taskType = task.code
      const taskCode = taskType.coding.find(
        (coding: fhir.Coding) =>
          coding.system === `${OPENCRVS_SPECIFICATION_URL}types`
      )
      return (taskCode && taskCode.code) || null
    },
    duplicates: async (task, _, authHeader) => {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const composition = await fetchFHIR(
        `/${task.focus.reference}`,
        authHeader
      )
      return (
        composition.relatesTo &&
        composition.relatesTo.map((duplicate: fhir.CompositionRelatesTo) => {
          if (
            duplicate.code &&
            duplicate.code === 'duplicate' &&
            duplicate.targetReference &&
            duplicate.targetReference.reference
          ) {
            return duplicate.targetReference.reference.split('/')[1]
          }
          return null
        })
      )
    },
    certificates: async (task, _, authHeader) => {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const compositionBundle = await fetchFHIR(
        `/${task.focus.reference}/_history`,
        authHeader
      )

      if (!compositionBundle || !compositionBundle.entry) {
        return null
      }

      return compositionBundle.entry.map(
        async (compositionEntry: fhir.BundleEntry) => {
          const certSection = findCompositionSection(
            CERTIFICATE_DOCS_CODE,
            compositionEntry.resource as ITemplatedComposition
          )
          if (
            !certSection ||
            !certSection.entry ||
            !(certSection.entry.length > 0)
          ) {
            return null
          }
          return await fetchFHIR(
            `/${certSection.entry[0].reference}`,
            authHeader
          )
        }
      )
    }
  },
  RegWorkflow: {
    type: (task: fhir.Task) => {
      return getStatusFromTask(task)
    },
    user: async (task, _, authHeader) => {
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension
      )
      if (!user || !user.valueReference || !user.valueReference.reference) {
        return null
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({
          practitionerId: user.valueReference.reference.split('/')[1]
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    },
    reason: (task: fhir.Task) => (task.reason && task.reason.text) || null,
    timestamp: (task) => task.lastModified,
    comments: (task) => task.note,
    location: async (task, _, authHeader) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
        task.extension
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return await fetchFHIR(
        `/${taskLocation.valueReference.reference}`,
        authHeader
      )
    },
    office: async (task, _, authHeader) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
        task.extension
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return await fetchFHIR(
        `/${taskLocation.valueReference.reference}`,
        authHeader
      )
    },
    timeLogged: async (task, _, authHeader) => {
      const compositionId =
        (task.focus.reference && task.focus.reference.split('/')[1]) || ''
      const timeLoggedResponse = (await getTimeLoggedFromMetrics(
        authHeader,
        compositionId,
        getStatusFromTask(task) || ''
      )) as ITimeLoggedResponse
      return (timeLoggedResponse && timeLoggedResponse.timeSpentEditing) || 0
    }
  },
  Comment: {
    user: (comment) => comment.authorString,
    comment: (comment) => comment.text,
    createdAt: (comment) => comment.time
  },
  Attachment: {
    id(docRef: fhir.DocumentReference) {
      return (docRef.masterIdentifier && docRef.masterIdentifier.value) || null
    },
    data(docRef: fhir.DocumentReference) {
      return docRef.content[0].attachment.data
    },
    contentType(docRef: fhir.DocumentReference) {
      return docRef.content[0].attachment.contentType
    },
    originalFileName(docRef: fhir.DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === ORIGINAL_FILE_NAME_SYSTEM
        )
      return (foundIdentifier && foundIdentifier.value) || null
    },
    systemFileName(docRef: fhir.DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === SYSTEM_FILE_NAME_SYSTEM
        )
      return (foundIdentifier && foundIdentifier.value) || null
    },
    type(docRef: fhir.DocumentReference) {
      return (
        (docRef.type && docRef.type.coding && docRef.type.coding[0].code) ||
        null
      )
    },
    subject(docRef: fhir.DocumentReference) {
      return (docRef.subject && docRef.subject.display) || null
    },
    createdAt(docRef: fhir.DocumentReference) {
      return docRef.created
    }
  },
  Certificate: {
    async collector(docRef: fhir.DocumentReference, _, authHeader) {
      const relatedPersonRef =
        docRef.extension &&
        docRef.extension.find(
          (extension: fhir.Extension) =>
            extension.url === `${OPENCRVS_SPECIFICATION_URL}extension/collector`
        )
      if (!relatedPersonRef) {
        return null
      }
      return (await fetchFHIR(
        `/${
          relatedPersonRef.valueReference &&
          relatedPersonRef.valueReference.reference
        }`,
        authHeader
      )) as fhir.RelatedPerson
    }
  },
  Identifier: {
    system: (identifier) => identifier.system,
    value: (identifier) => identifier.value
  },

  Location: {
    name: (location) => location.name,
    status: (location) => location.status,
    identifier: (location) => location.identifier,
    longitude: (location) => location.position.longitude,
    latitude: (location) => location.position.latitude,
    alias: (location) => location.alias,
    description: (location) => location.description,
    partOf: (location) => location.partOf,
    type: (location: fhir.Location) => {
      return (
        (location.type &&
          location.type.coding &&
          location.type.coding[0].code) ||
        null
      )
    },
    address: (location) => location.address
  },

  ReasonsNotApplying: {
    primaryCaregiverType: (reasonNotApplying) =>
      reasonNotApplying.primaryCaregiverType,
    reasonNotApplying: (reasonNotApplying) =>
      reasonNotApplying.reasonNotApplying,
    isDeceased: (reasonNotApplying) => reasonNotApplying.isDeceased
  },

  PrimaryCaregiver: {
    primaryCaregiver: async (primaryCaregiver, _, authHeader) => {
      if (
        !primaryCaregiver.patientSection ||
        !primaryCaregiver.patientSection.entry ||
        primaryCaregiver.patientSection.entry.length === 0
      ) {
        return null
      }
      return (await fetchFHIR(
        `/${primaryCaregiver.patientSection.entry[0].reference}`,
        authHeader
      )) as fhir.Person
    },
    reasonsNotApplying: async (primaryCaregiver, _, authHeader) => {
      const observations = (await fetchFHIR(
        `/Observation?encounter=${primaryCaregiver.encounterSection.entry[0].reference}`,
        authHeader
      )) as fhir.Bundle
      const reasons: {
        primaryCaregiverType?: string
        reasonNotApplying?: string
        isDeceased?: boolean
      }[] = []
      let primaryCaregiverType
      let reasonCaregiverNotApplying

      if (!observations.entry) {
        return reasons
      }

      observations.entry.forEach((observationResource) => {
        const observation = observationResource.resource as fhir.Observation
        const observationCode =
          observation.code &&
          observation.code.coding &&
          observation.code.coding[0].code
        const reasonNotApplying =
          observation.valueString !== 'DECEASED' ? observation.valueString : ''
        const isDeceased = observation.valueString === 'DECEASED' ? true : false
        const careGiverType =
          observationCode === REASON_MOTHER_NOT_APPLYING
            ? 'MOTHER'
            : observationCode === REASON_FATHER_NOT_APPLYING
            ? 'FATHER'
            : ''
        if (careGiverType) {
          reasons.push({
            primaryCaregiverType: careGiverType,
            reasonNotApplying,
            isDeceased
          })
        } else if (observationCode === REASON_CAREGIVER_NOT_APPLYING) {
          reasonCaregiverNotApplying = observation.valueString
        } else if (observationCode === PRIMARY_CAREGIVER) {
          primaryCaregiverType = observation.valueString
        }
      })

      if (primaryCaregiver && reasonCaregiverNotApplying) {
        reasons.push({
          primaryCaregiverType,
          reasonNotApplying: reasonCaregiverNotApplying
        })
      } else if (primaryCaregiver && !reasonCaregiverNotApplying) {
        reasons.push({
          primaryCaregiverType
        })
      }

      return reasons
    },
    parentDetailsType: async (primaryCaregiver, _, authHeader) => {
      const observations = await fetchFHIR(
        `/Observation?encounter=${primaryCaregiver.encounterSection.entry[0].reference}&code=${PARENT_DETAILS}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueString) ||
        null
      )
    }
  },
  MedicalPractitioner: {
    name: async (encounterParticipant, _, authHeader) => {
      if (
        !encounterParticipant ||
        !encounterParticipant.individual ||
        !encounterParticipant.individual.reference
      ) {
        return null
      }
      const practitioner = await fetchFHIR(
        `/${encounterParticipant.individual.reference}`,
        authHeader
      )
      return (
        (practitioner &&
          practitioner.name &&
          practitioner.name[0] &&
          practitioner.name[0].family) ||
        null
      )
    },
    qualification: async (encounterParticipant, _, authHeader) => {
      if (
        !encounterParticipant ||
        !encounterParticipant.individual ||
        !encounterParticipant.individual.reference
      ) {
        return null
      }
      const practitioner = await fetchFHIR(
        `/${encounterParticipant.individual.reference}`,
        authHeader
      )
      return (
        (practitioner &&
          practitioner.qualification &&
          practitioner.qualification[0] &&
          practitioner.qualification[0].code &&
          practitioner.qualification[0].code.coding &&
          practitioner.qualification[0].code.coding[0] &&
          practitioner.qualification[0].code.coding[0].code) ||
        null
      )
    },
    lastVisitDate: async (encounterParticipant, _, authHeader) => {
      return (
        (encounterParticipant &&
          encounterParticipant.period &&
          encounterParticipant.period.start) ||
        null
      )
    }
  },

  History: {
    action: async (task) => {
      const businessStatus = getStatusFromTask(task)
      const extensionStatusWhileDownloaded = getDownloadedExtensionStatus(task)
      if (businessStatus === extensionStatusWhileDownloaded) {
        return 'DOWNLOADED'
      }
      return businessStatus
    },
    date: (task) => task.lastModified,
    user: async (task, _, authHeader) => {
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension
      )
      if (!user || !user.valueReference || !user.valueReference.reference) {
        return null
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({
          practitionerId: user.valueReference.reference.split('/')[1]
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    },
    location: async (task, _, authHeader) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
        task.extension
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return await fetchFHIR(
        `/${taskLocation.valueReference.reference}`,
        authHeader
      )
    },
    office: async (task, _, authHeader) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
        task.extension
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return await fetchFHIR(
        `/${taskLocation.valueReference.reference}`,
        authHeader
      )
    }
  },

  DeathRegistration: {
    // tslint:disable-next-line
    async _fhirIDMap(composition: ITemplatedComposition, _, authHeader) {
      return {
        composition: composition.id
      }
    },
    createdAt(composition: ITemplatedComposition) {
      return composition.date
    },
    async mother(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async father(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async spouse(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(SPOUSE_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async deceased(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(DECEASED_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async informant(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return (await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )) as fhir.RelatedPerson
    },
    async registration(composition: ITemplatedComposition, _, authHeader) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${composition.id}`,
        authHeader
      )

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }
      return taskBundle.entry[0].resource
    },

    async eventLocation(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const data = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )

      if (!data || !data.location || !data.location[0].location) {
        return null
      }

      return await fetchFHIR(
        `/${data.location[0].location.reference}`,
        authHeader
      )
    },
    async mannerOfDeath(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${MANNER_OF_DEATH_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async causeOfDeathMethod(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${CAUSE_OF_DEATH_METHOD_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async causeOfDeath(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${CAUSE_OF_DEATH_CODE}`,
        authHeader
      )

      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async maleDependentsOfDeceased(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${MALE_DEPENDENTS_ON_DECEASED_CODE}`,
        authHeader
      )
      return observations &&
        observations.entry &&
        observations.entry[0] &&
        observations.entry[0].resource
        ? observations.entry[0].resource.valueString
        : null
    },
    async femaleDependentsOfDeceased(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${FEMALE_DEPENDENTS_ON_DECEASED_CODE}`,
        authHeader
      )

      return observations &&
        observations.entry &&
        observations.entry[0] &&
        observations.entry[0].resource
        ? observations.entry[0].resource.valueString
        : null
    },
    async medicalPractitioner(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const encounter = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )
      const encounterParticipant =
        encounter && encounter.participant && encounter.participant[0]
      if (!encounterParticipant) {
        return null
      }
      return encounterParticipant
    }
  },
  BirthRegistration: {
    // tslint:disable-next-line
    async _fhirIDMap(composition: ITemplatedComposition, _, authHeader) {
      // Preparing Encounter
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )

      const encounterReference =
        encounterSection &&
        encounterSection.entry &&
        encounterSection.entry[0].reference

      if (!encounterReference) {
        return {
          composition: composition.id
        }
      }

      const observation = {}
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterReference}`,
        authHeader
      )

      const encounter = await fetchFHIR(`/${encounterReference}`, authHeader)

      if (observations) {
        const observationKeys = {
          weightAtBirth: BODY_WEIGHT_CODE,
          birthType: BIRTH_TYPE_CODE,
          attendantAtBirth: BIRTH_ATTENDANT_CODE,
          birthRegistrationType: BIRTH_REG_TYPE_CODE,
          presentAtBirthRegistration: BIRTH_REG_PRESENT_CODE,
          childrenBornAliveToMother: NUMBER_BORN_ALIVE_CODE,
          foetalDeathsToMother: NUMBER_FOEATAL_DEATH_CODE,
          lastPreviousLiveBirth: LAST_LIVE_BIRTH_CODE
        }
        observations.entry.map(
          (item: fhir.Observation & { resource: fhir.Observation }) => {
            if (
              item.resource &&
              item.resource.code.coding &&
              item.resource.code.coding[0] &&
              item.resource.code.coding[0].code
            ) {
              const itemCode = item.resource.code.coding[0].code
              const observationKey = Object.keys(observationKeys).find(
                (key) => observationKeys[key] === itemCode
              )
              if (observationKey) {
                observation[observationKey] = item.resource.id
              }
            }
          }
        )
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation:
          encounter.location &&
          encounter.location[0].location.reference.split('/')[1],
        observation
      }
    },
    createdAt(composition: ITemplatedComposition) {
      return composition.date
    },
    async mother(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async father(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async child(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async informant(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return (await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )) as fhir.RelatedPerson
    },
    async primaryCaregiver(composition: ITemplatedComposition, _, authHeader) {
      const patientSection = findCompositionSection(
        PRIMARY_CAREGIVER_CODE,
        composition
      )

      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }

      return {
        patientSection,
        encounterSection
      }
    },
    async registration(composition: ITemplatedComposition, _, authHeader) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${composition.id}`,
        authHeader
      )

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }
      return taskBundle.entry[0].resource
    },
    async weightAtBirth(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BODY_WEIGHT_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueQuantity.value) ||
        null
      )
    },
    async birthType(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BIRTH_TYPE_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueQuantity.value) ||
        null
      )
    },
    async eventLocation(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const data = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )

      if (!data || !data.location || !data.location[0].location) {
        return null
      }

      return await fetchFHIR(
        `/${data.location[0].location.reference}`,
        authHeader
      )
    },
    async attendantAtBirth(composition: ITemplatedComposition, _, authHeader) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BIRTH_ATTENDANT_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueString) ||
        null
      )
    },
    async birthRegistrationType(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BIRTH_REG_TYPE_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueString) ||
        null
      )
    },
    async presentAtBirthRegistration(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BIRTH_REG_PRESENT_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueString) ||
        null
      )
    },
    async childrenBornAliveToMother(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${NUMBER_BORN_ALIVE_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueInteger) ||
        null
      )
    },
    async foetalDeathsToMother(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${NUMBER_FOEATAL_DEATH_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueInteger) ||
        null
      )
    },
    async lastPreviousLiveBirth(
      composition: ITemplatedComposition,
      _,
      authHeader
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${LAST_LIVE_BIRTH_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueDateTime) ||
        null
      )
    },
    async history(composition: ITemplatedComposition, _, authHeader) {
      const taskHistory = await fetchFHIR(
        `/Task/_history?focus=Composition/${composition.id}`,
        authHeader
      )

      if (!taskHistory.entry[0] || !taskHistory.entry[0].resource) {
        return null
      }

      return taskHistory?.entry?.map(
        (item: {
          resource: { extension: any }
          extension: fhir.Extension[]
        }) => {
          return item.resource
        }
      )
    }
  }
}
