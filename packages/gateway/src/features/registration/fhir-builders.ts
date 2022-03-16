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
import transformObj, { IFieldBuilders } from '@gateway/features/transformation'
import { v4 as uuid } from 'uuid'
import {
  createCompositionTemplate,
  updateTaskTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  BIRTH_ENCOUNTER_CODE,
  BIRTH_TYPE_CODE,
  ATTACHMENT_DOCS_CODE,
  BODY_WEIGHT_CODE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_REG_TYPE_CODE,
  BIRTH_REG_PRESENT_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE,
  LAST_LIVE_BIRTH_CODE,
  MALE_DEPENDENTS_ON_DECEASED_CODE,
  FEMALE_DEPENDENTS_ON_DECEASED_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_DESC,
  OBSERVATION_CATEGORY_VSIGN_CODE,
  OBSERVATION_CATEGORY_VSIGN_DESC,
  MOTHER_TITLE,
  FATHER_TITLE,
  CHILD_TITLE,
  ATTACHMENT_DOCS_TITLE,
  ATTACHMENT_CONTEXT_KEY,
  DEATH_ENCOUNTER_CODE,
  CAUSE_OF_DEATH_CODE,
  DECEASED_CODE,
  DECEASED_TITLE,
  INFORMANT_CODE,
  INFORMANT_TITLE,
  MANNER_OF_DEATH_CODE,
  CAUSE_OF_DEATH_METHOD_CODE,
  PRIMARY_CAREGIVER,
  PRIMARY_CAREGIVER_CODE,
  PRIMARY_CAREGIVER_TITLE,
  PARENT_DETAILS,
  SPOUSE_CODE,
  SPOUSE_TITLE,
  BIRTH_CORRECTION_ENCOUNTER_CODE,
  DEATH_CORRECTION_ENCOUNTER_CODE
} from '@gateway/features/fhir/templates'
import {
  selectOrCreateEncounterResource,
  selectOrCreateObservationResource,
  selectOrCreatePersonResource,
  selectOrCreateDocRefResource,
  setObjectPropInResourceArray,
  getMaritalStatusCode,
  selectOrCreateTaskRefResource,
  selectOrCreateCertificateDocRefResource,
  selectOrCreateRelatedPersonResource,
  selectOrCreateCollectorPersonResource,
  setCertificateCollectorReference,
  selectOrCreatePaymentReconciliationResource,
  selectOrCreateLocationRefResource,
  selectOrCreateEncounterLocationRef,
  selectOrCreateInformantSection,
  selectOrCreateInformantResource,
  setInformantReference,
  fetchFHIR,
  setPrimaryCaregiverReference,
  selectObservationResource,
  getReasonCodeAndDesc,
  removeObservationResource,
  selectOrCreateEncounterPartitioner,
  selectOrCreateEncounterParticipant,
  selectOrCreateQuestionnaireResource,
  findExtension,
  setQuestionnaireItem
} from '@gateway/features/fhir/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  FHIR_SPECIFICATION_URL,
  EVENT_TYPE
} from '@gateway/features/fhir/constants'
import { IAuthHeader } from '@gateway/common-types'

function createNameBuilder(sectionCode: string, sectionTitle: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'name',
        fieldValue.split(' '),
        'given',
        context
      )
    },
    familyName: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'name',
        [fieldValue],
        'family',
        context
      )
    }
  }
}
function createIDBuilder(sectionCode: string, sectionTitle: string) {
  return {
    id: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: { authHeader: IAuthHeader }
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'value',
        context
      )
      if (!person.id) {
        const personSearchSet = await fetchFHIR(
          `/Patient?identifier=${fieldValue}`,
          context.authHeader
        )
        if (
          person &&
          personSearchSet &&
          personSearchSet.entry &&
          personSearchSet.entry[0] &&
          personSearchSet.entry[0].resource
        ) {
          person.id = personSearchSet.entry[0].resource.id
        }
      }
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'type',
        context
      )
    },
    otherType: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'otherType',
        context
      )
    }
  }
}

function createTelecomBuilder(sectionCode: string, sectionTitle: string) {
  return {
    system: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'system',
        context
      )
    },
    value: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'value',
        context
      )
    },
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'use',
        context
      )
    }
  }
}

function createPhotoBuilder(sectionCode: string, sectionTitle: string) {
  return {
    contentType: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'photo',
        fieldValue,
        'contentType',
        context
      )
    },
    data: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(person, 'photo', fieldValue, 'data', context)
    },
    title: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'photo',
        fieldValue,
        'title',
        context
      )
    }
  }
}

function createAddressBuilder(sectionCode: string, sectionTitle: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'use',
        context
      )
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'type',
        context
      )
    },
    text: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'text',
        context
      )
    },
    line: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      if (!person.address) {
        person.address = []
      }
      if (!person.address[context._index.address]) {
        person.address[context._index.address] = {}
      }
      if (!person.address[context._index.address].line) {
        person.address[context._index.address].line = []
      }
      ;(person.address[context._index.address].line as string[]).push(
        fieldValue
      )
    },
    city: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'city',
        context
      )
    },
    district: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'district',
        context
      )
    },
    state: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'state',
        context
      )
    },
    postalCode: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'postalCode',
        context
      )
    },
    country: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'country',
        context
      )
    }
  }
}

function createLocationAddressBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.use = fieldValue
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!location.address) {
        location.address = {}
      }
      location.address.type = fieldValue
    },
    text: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!location.address) {
        location.address = {}
      }
      location.address.text = fieldValue
    },
    line: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!location.address) {
        location.address = {}
      }
      if (!location.address.line) {
        location.address.line = []
      }
      ;(location.address.line as string[]).push(fieldValue)
    },
    city: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.city = fieldValue
    },
    district: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.district = fieldValue
    },
    state: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.state = fieldValue
    },
    postalCode: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.postalCode = fieldValue
    },
    country: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.country = fieldValue
    }
  }
}

function createDateOfMarriageBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    valueDateTime: fieldValue
  })
}

function createAgeBuilder(resource: fhir.Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/age`,
    valueString: fieldValue
  })
}

function createNationalityBuilder(resource: fhir.Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }

  resource.extension.push({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: [{ system: 'urn:iso:std:iso:3166', code: fieldValue }]
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
}

function createMaritalStatusBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  resource.maritalStatus = {
    coding: [
      {
        system: `${FHIR_SPECIFICATION_URL}marital-status`,
        code: getMaritalStatusCode(fieldValue)
      }
    ],
    text: fieldValue
  }
}

function createOccupationBulder(resource: fhir.Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasOccupation = resource.extension.find(
    (extention) =>
      extention.url ===
      `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`
  )

  if (hasOccupation) {
    hasOccupation.valueString = fieldValue
  } else {
    resource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
      valueString: fieldValue
    })
  }
}

function createEducationalAttainmentBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }

  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
    valueString: fieldValue
  })
}

function createInformantShareContact(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
    valueString: fieldValue
  })
}

function createInformantRelationship(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-relationship`,
    valueString: fieldValue
  })
}

function createInformantShareContactNumber(
  resource: fhir.Task,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
    valueString: fieldValue
  })
}

function createInCompleteFieldListExt(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/in-complete-fields`,
    valueString: fieldValue
  })
}

function setResourceIdentifier(
  resource: fhir.Task,
  identifierName: string,
  fieldValue: string
) {
  if (!resource.identifier) {
    resource.identifier = []
  }
  resource.identifier.push({
    system: `${OPENCRVS_SPECIFICATION_URL}id/${identifierName}`,
    value: fieldValue
  })
}

function createRegStatusComment(
  resource: fhir.Task,
  fieldValue: string,
  context: any
) {
  if (!resource.note) {
    resource.note = []
  }
  if (!resource.note[context._index.comments]) {
    resource.note[context._index.comments] = { text: '' }
  }
  resource.note[context._index.comments].text = fieldValue
}

function createRegStatusCommentTimeStamp(
  resource: fhir.Task,
  fieldValue: string,
  context: any
) {
  if (!resource.note) {
    resource.note = []
  }
  if (!resource.note[context._index.comments]) {
    resource.note[context._index.comments] = {
      /* as text is a mendatory field for note */
      text: ''
    }
  }
  resource.note[context._index.comments].time = fieldValue
}

function createQuestionnaireBuilder() {
  return {
    fieldName: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const questionnaire = selectOrCreateQuestionnaireResource(fhirBundle)
      setQuestionnaireItem(questionnaire, context, fieldValue, null)
    },
    value: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const questionnaire = selectOrCreateQuestionnaireResource(fhirBundle)
      setQuestionnaireItem(questionnaire, context, null, fieldValue)
    }
  }
}

function createActionTypesBuilder() {
  const actionType = {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/action-type',
        code: 'update'
      }
    ]
  }
  return {
    section: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'input',
        fieldValue,
        'valueCode',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'output',
        fieldValue,
        'valueCode',
        context,
        'values'
      )
    },
    fieldName: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'input',
        fieldValue,
        'valueId',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'output',
        fieldValue,
        'valueId',
        context,
        'values'
      )
    },
    oldValue: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'input',
        actionType,
        'type',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'input',
        fieldValue,
        'valueString',
        context,
        'values'
      )
    },
    newValue: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'output',
        actionType,
        'type',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'output',
        fieldValue,
        'valueString',
        context,
        'values'
      )
    }
  }
}

export const builders: IFieldBuilders = {
  _fhirIDMap: {
    composition: (fhirBundle, fieldValue) => {
      fhirBundle.entry[0].resource.id = fieldValue as string
    },
    encounter: (fhirBundle, fieldValue, context) => {
      const encounter = selectOrCreateEncounterResource(fhirBundle, context)
      encounter.id = fieldValue as string
    },
    eventLocation: (fhirBundle, fieldValue) => {
      return false
    },
    observation: {
      birthType: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          BIRTH_TYPE_CODE,
          'Birth plurality of Pregnancy',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      weightAtBirth: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          BODY_WEIGHT_CODE,
          'Body weight Measured',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      attendantAtBirth: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          BIRTH_ATTENDANT_CODE,
          'Birth attendant title',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      birthRegistrationType: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          BIRTH_REG_TYPE_CODE,
          'Birth registration type',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      presentAtBirthRegistration: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          BIRTH_REG_PRESENT_CODE,
          'Present at birth registration',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      childrenBornAliveToMother: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          NUMBER_BORN_ALIVE_CODE,
          'Number born alive to mother',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      foetalDeathsToMother: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          NUMBER_FOEATAL_DEATH_CODE,
          'Number foetal deaths to mother',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      lastPreviousLiveBirth: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          LAST_LIVE_BIRTH_CODE,
          'Date last live birth',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      }
    }
  },
  createdAt: (fhirBundle, fieldValue, context) => {
    if (!fhirBundle.meta) {
      fhirBundle.meta = {}
    }
    fhirBundle.meta.lastUpdated = fieldValue
    fhirBundle.entry[0].resource.date = fieldValue

    const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
    taskResource.lastModified = fieldValue as string
    return
  },
  mother: {
    _fhirID: (fhirBundle, fieldValue) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.gender = fieldValue as string
    },
    identifier: createIDBuilder(MOTHER_CODE, MOTHER_TITLE),
    name: createNameBuilder(MOTHER_CODE, MOTHER_TITLE),
    telecom: createTelecomBuilder(MOTHER_CODE, MOTHER_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(MOTHER_CODE, MOTHER_TITLE),
    photo: createPhotoBuilder(MOTHER_CODE, MOTHER_TITLE),
    deceased: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.deceasedBoolean = fieldValue as boolean
    },
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  father: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.gender = fieldValue as string
    },
    identifier: createIDBuilder(FATHER_CODE, FATHER_TITLE),
    name: createNameBuilder(FATHER_CODE, FATHER_TITLE),
    telecom: createTelecomBuilder(FATHER_CODE, FATHER_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(FATHER_CODE, FATHER_TITLE),
    photo: createPhotoBuilder(FATHER_CODE, FATHER_TITLE),
    deceased: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.deceasedBoolean = fieldValue as boolean
    },

    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  spouse: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const spouse = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      spouse.id = fieldValue as string
    },
    name: createNameBuilder(SPOUSE_CODE, SPOUSE_TITLE)
  },
  child: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.gender = fieldValue as string
    },
    identifier: createIDBuilder(CHILD_CODE, CHILD_TITLE),
    name: createNameBuilder(CHILD_CODE, CHILD_TITLE),
    telecom: createTelecomBuilder(CHILD_CODE, CHILD_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(CHILD_CODE, CHILD_TITLE),
    photo: createPhotoBuilder(CHILD_CODE, CHILD_TITLE),
    deceased: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.deceasedBoolean = fieldValue as boolean
    },

    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  deceased: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.gender = fieldValue as string
    },
    identifier: createIDBuilder(DECEASED_CODE, DECEASED_TITLE),
    name: createNameBuilder(DECEASED_CODE, DECEASED_TITLE),
    telecom: createTelecomBuilder(DECEASED_CODE, DECEASED_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.birthDate = fieldValue as string
    },
    age: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createAgeBuilder(person, fieldValue as string)
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(DECEASED_CODE, DECEASED_TITLE),
    photo: createPhotoBuilder(DECEASED_CODE, DECEASED_TITLE),
    deceased: {
      deceased: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          DECEASED_CODE,
          DECEASED_TITLE,
          fhirBundle
        )
        person.deceasedBoolean = fieldValue as boolean
      },
      deathDate: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          DECEASED_CODE,
          DECEASED_TITLE,
          fhirBundle
        )
        person.deceasedDateTime = fieldValue as string
      }
    },
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  informant: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )
      relatedPersonResource.id = fieldValue
    },
    individual: {
      _fhirID: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        person.id = fieldValue as string
      },
      gender: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        person.gender = fieldValue as string
      },
      identifier: {
        id: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'identifier',
            fieldValue,
            'value',
            context
          )
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'identifier',
            fieldValue,
            'type',
            context
          )
        },
        otherType: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'identifier',
            fieldValue,
            'otherType',
            context
          )
        }
      },
      name: {
        use: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'name',
            fieldValue,
            'use',
            context
          )
        },
        firstNames: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'name',
            fieldValue.split(' '),
            'given',
            context
          )
        },
        familyName: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'name',
            [fieldValue],
            'family',
            context
          )
        }
      },
      telecom: {
        system: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'telecom',
            fieldValue,
            'system',
            context
          )
        },
        value: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'telecom',
            fieldValue,
            'value',
            context
          )
        },
        use: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'telecom',
            fieldValue,
            'use',
            context
          )
        }
      },
      birthDate: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        person.birthDate = fieldValue as string
      },
      maritalStatus: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        return createMaritalStatusBuilder(person, fieldValue as string)
      },
      multipleBirth: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        person.multipleBirthInteger = fieldValue as number
      },
      address: {
        use: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'use',
            context
          )
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'type',
            context
          )
        },
        text: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'text',
            context
          )
        },
        line: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          if (!person.address) {
            person.address = []
          }
          if (!person.address[context._index.address]) {
            person.address[context._index.address] = {}
          }
          if (!person.address[context._index.address].line) {
            person.address[context._index.address].line = []
          }
          ;(person.address[context._index.address].line as string[]).push(
            fieldValue
          )
        },
        city: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'city',
            context
          )
        },
        district: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'district',
            context
          )
        },
        state: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'state',
            context
          )
        },
        postalCode: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'postalCode',
            context
          )
        },
        country: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'address',
            fieldValue,
            'country',
            context
          )
        }
      },
      photo: {
        contentType: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'photo',
            fieldValue,
            'contentType',
            context
          )
        },
        data: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'photo',
            fieldValue,
            'data',
            context
          )
        },
        title: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const person = selectOrCreateInformantResource(fhirBundle)
          setObjectPropInResourceArray(
            person,
            'photo',
            fieldValue,
            'title',
            context
          )
        }
      },
      nationality: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        return createNationalityBuilder(person, fieldValue)
      },
      occupation: (fhirBundle, fieldValue) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        return createOccupationBulder(person, fieldValue as string)
      },
      dateOfMarriage: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        return createDateOfMarriageBuilder(person, fieldValue)
      },
      educationalAttainment: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        return createEducationalAttainmentBuilder(person, fieldValue)
      }
    },
    relationship: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )

      relatedPersonResource.relationship = {
        coding: [
          {
            system:
              'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
            code: fieldValue
          }
        ]
      }
      if (context.event === EVENT_TYPE.BIRTH) {
        if (fieldValue === 'MOTHER') {
          await setInformantReference(
            MOTHER_CODE,
            relatedPersonResource,
            fhirBundle,
            context
          )
        } else if (fieldValue === 'FATHER') {
          await setInformantReference(
            FATHER_CODE,
            relatedPersonResource,
            fhirBundle,
            context
          )
        }
      }
    },
    otherRelationship: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )
      if (!relatedPersonResource.relationship) {
        relatedPersonResource.relationship = {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'OTHER'
            }
          ]
        }
      }
      relatedPersonResource.relationship.text = fieldValue
    }
  },
  registration: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      taskResource.id = fieldValue as string
    },
    contact: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareContact(taskResource, fieldValue)
    },
    contactRelationship: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantRelationship(taskResource, fieldValue)
    },
    contactPhoneNumber: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareContactNumber(taskResource, fieldValue)
    },
    draftId: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'draft-id', fieldValue)
    },
    trackingId: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      let trackingId
      if (context.event === EVENT_TYPE.BIRTH) {
        trackingId = 'birth-tracking-id'
      } else {
        trackingId = 'death-tracking-id'
      }
      return setResourceIdentifier(taskResource, `${trackingId}`, fieldValue)
    },
    registrationNumber: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      let regNumber
      if (context.event === EVENT_TYPE.BIRTH) {
        regNumber = 'birth-registration-number'
      } else {
        regNumber = 'death-registration-number'
      }
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, `${regNumber}`, fieldValue)
    },
    inCompleteFields: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      taskResource.status = 'draft'
      return createInCompleteFieldListExt(taskResource, fieldValue)
    },
    paperFormID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'paper-form-id', fieldValue)
    },
    correction: {
      requester: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        if (!taskResource.extension) {
          taskResource.extension = []
        }
        const requesterExtensionURL = `${OPENCRVS_SPECIFICATION_URL}extension/requestingIndividual`
        const requesterExtension = taskResource.extension.find(
          (ext) => ext.url === requesterExtensionURL
        )
        if (!requesterExtension) {
          taskResource.extension.push({
            url: requesterExtensionURL,
            valueString: fieldValue
          })
        } else {
          requesterExtension.valueString = fieldValue
        }
      },
      hasShowedVerifiedDocument: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) =>
            extention.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      attestedAndCopied: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) =>
            extention.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/attestedAndCopied`
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/attestedAndCopied`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      noSupportingDocumentationRequired: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) =>
            extention.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/noSupportingDocumentationRequired`
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/noSupportingDocumentationRequired`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      payments: {
        paymentId: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.identifier) {
            paymentResource.identifier = []
          }
          paymentResource.identifier.push({
            system: `${OPENCRVS_SPECIFICATION_URL}id/payment-id`,
            value: fieldValue
          })
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                type: {
                  coding: [{ code: fieldValue }]
                }
              }
            ]
          } else {
            paymentResource.detail[0].type = {
              coding: [{ code: fieldValue }]
            }
          }
        },
        total: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          paymentResource.total = fieldValue as fhir.Money
        },
        amount: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                amount: fieldValue as fhir.Money
              }
            ]
          } else {
            paymentResource.detail[0].amount = fieldValue as fhir.Money
          }
        },
        outcome: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH,
            true
          )
          paymentResource.outcome = {
            coding: [{ code: fieldValue }]
          }
        },
        date: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                date: fieldValue
              }
            ]
          } else {
            paymentResource.detail[0].date = fieldValue
          }
        },
        data: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const certDocResource = selectOrCreateCertificateDocRefResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!certDocResource.content) {
            certDocResource.content = []
          }

          certDocResource.content.push({
            attachment: {
              contentType: 'image/jpg',
              data: fieldValue
            }
          })
        }
      },
      location: {
        _fhirID: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          const encounterRef = selectOrCreateEncounterResource(
            fhirBundle,
            context,
            true
          )
          const encounterLocationRef = selectOrCreateEncounterLocationRef(
            fhirBundle,
            context,
            true
          )

          //@ts-ignore
          taskResource.encounter = encounterRef._id
          encounterLocationRef.reference = `Location/${fieldValue}`
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          let location
          location = selectOrCreateLocationRefResource(
            context.event === EVENT_TYPE.BIRTH
              ? BIRTH_CORRECTION_ENCOUNTER_CODE
              : DEATH_CORRECTION_ENCOUNTER_CODE,
            fhirBundle,
            context
          )
          location.type = {
            coding: [
              {
                system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
                code: fieldValue
              }
            ]
          }
        },
        partOf: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const location = selectOrCreateLocationRefResource(
            context.event === EVENT_TYPE.BIRTH
              ? BIRTH_CORRECTION_ENCOUNTER_CODE
              : DEATH_CORRECTION_ENCOUNTER_CODE,
            fhirBundle,
            context
          )
          location.partOf = {
            reference: fieldValue
          }
        },
        address: (_, __, context: any) =>
          createLocationAddressBuilder(
            context.event === EVENT_TYPE.BIRTH
              ? BIRTH_CORRECTION_ENCOUNTER_CODE
              : DEATH_CORRECTION_ENCOUNTER_CODE
          )
      },
      values: createActionTypesBuilder(),
      data: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.content) {
          certDocResource.content = []
        }

        certDocResource.content.push({
          attachment: {
            contentType: 'application/pdf',
            data: fieldValue
          }
        })
      },
      reason: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        if (!taskResource.reason) {
          taskResource.reason = {}
        }
        taskResource.reason.text = fieldValue
      },
      note: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

        const newNote: fhir.Annotation = {
          text: fieldValue ? fieldValue : '',
          time: new Date().toUTCString(),
          authorString: ''
        }
        if (!taskResource.note) {
          taskResource.note = []
        }
        taskResource.note.push(newNote)
      }
    },
    questionnaire: createQuestionnaireBuilder(),
    status: {
      comments: {
        comment: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          return createRegStatusComment(taskResource, fieldValue, context)
        },
        createdAt: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          return createRegStatusCommentTimeStamp(
            taskResource,
            fieldValue,
            context
          )
        }
      },
      timestamp: () => {
        return
      },
      timeLoggedMS: (
        fhirBundle: ITemplatedBundle,
        fieldValue: number,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

        if (!taskResource.extension) {
          taskResource.extension = []
        }

        const hasTimeLoggedMS = taskResource.extension.find(
          (extension) =>
            extension.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/timeLoggedMS`
        )

        if (hasTimeLoggedMS && hasTimeLoggedMS.valueInteger) {
          hasTimeLoggedMS.valueInteger =
            hasTimeLoggedMS.valueInteger + fieldValue
        } else {
          taskResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/timeLoggedMS`,
            valueInteger: fieldValue
          })
        }
        return
      }
    },
    attachments: {
      _fhirID: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.id = fieldValue as string
      },
      originalFileName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.identifier) {
          docRef.identifier = []
        }

        docRef.identifier.push({
          system: `${OPENCRVS_SPECIFICATION_URL}id/original-file-name`,
          value: fieldValue
        })
      },
      systemFileName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.identifier) {
          docRef.identifier = []
        }

        docRef.identifier.push({
          system: `${OPENCRVS_SPECIFICATION_URL}id/system-file-name`,
          value: fieldValue
        })
      },
      status: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.docStatus = fieldValue
      },
      type: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.type = {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}supporting-doc-type`,
              code: fieldValue
            }
          ]
        }
      },
      createdAt: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.created = fieldValue
        docRef.indexed = fieldValue
      },
      contentType: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content) {
          docRef.content = [
            {
              attachment: {}
            }
          ]
        }
        docRef.content[0].attachment.contentType = fieldValue
      },
      data: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content) {
          docRef.content = [
            {
              attachment: {}
            }
          ]
        }
        docRef.content[0].attachment.data = fieldValue
      },
      subject: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.subject) {
          docRef.subject = {}
        }
        docRef.subject.display = fieldValue
      }
    },
    certificates: {
      collector: {
        relationship: async (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const relatedPersonResource = selectOrCreateRelatedPersonResource(
            fhirBundle,
            context,
            context.event
          )
          if (
            relatedPersonResource.relationship &&
            relatedPersonResource.relationship.coding
          ) {
            relatedPersonResource.relationship.coding[0].code = fieldValue
          } else {
            relatedPersonResource.relationship = {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                  code: fieldValue
                }
              ]
            }
          }
          /* if mother/father is collecting then we will just put the person ref here */
          if (fieldValue === 'MOTHER') {
            await setCertificateCollectorReference(
              MOTHER_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'FATHER') {
            await setCertificateCollectorReference(
              FATHER_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'INFORMANT') {
            await setCertificateCollectorReference(
              INFORMANT_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          }
        },
        otherRelationship: async (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const relatedPersonResource = selectOrCreateRelatedPersonResource(
            fhirBundle,
            context,
            context.event
          )
          if (
            relatedPersonResource.relationship &&
            relatedPersonResource.relationship.coding
          ) {
            relatedPersonResource.relationship.coding[0].display = fieldValue
          } else {
            relatedPersonResource.relationship = {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                  display: fieldValue
                }
              ]
            }
          }
        },
        affidavit: {
          contentType: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const relatedPersonResource = selectOrCreateRelatedPersonResource(
              fhirBundle,
              context,
              context.event
            )
            if (!relatedPersonResource.extension) {
              relatedPersonResource.extension = []
            }
            const hasAffidavit = relatedPersonResource.extension.find(
              (extention) =>
                extention.url ===
                `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`
            )
            if (!hasAffidavit) {
              relatedPersonResource.extension.push({
                url: `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`,
                valueAttachment: {
                  contentType: fieldValue
                }
              })
            } else {
              hasAffidavit.valueAttachment = {
                ...hasAffidavit.valueAttachment,
                contentType: fieldValue
              }
            }
          },
          data: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const relatedPersonResource = selectOrCreateRelatedPersonResource(
              fhirBundle,
              context,
              context.event
            )
            if (!relatedPersonResource.extension) {
              relatedPersonResource.extension = []
            }
            const hasAffidavit = relatedPersonResource.extension.find(
              (extention) =>
                extention.url ===
                `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`
            )
            if (!hasAffidavit) {
              relatedPersonResource.extension.push({
                url: `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`,
                valueAttachment: {
                  data: fieldValue
                }
              })
            } else {
              hasAffidavit.valueAttachment = {
                ...hasAffidavit.valueAttachment,
                data: fieldValue
              }
            }
          }
        },
        /* expecting value for this only when other is selected as relationship */
        individual: {
          identifier: {
            id: (
              fhirBundle: ITemplatedBundle,
              fieldValue: string,
              context: any
            ) => {
              const person = selectOrCreateCollectorPersonResource(
                fhirBundle,
                context,
                context.event
              )
              setObjectPropInResourceArray(
                person,
                'identifier',
                fieldValue,
                'id',
                context
              )
            },
            type: (
              fhirBundle: ITemplatedBundle,
              fieldValue: string,
              context: any
            ) => {
              const person = selectOrCreateCollectorPersonResource(
                fhirBundle,
                context,
                context.event
              )
              setObjectPropInResourceArray(
                person,
                'identifier',
                fieldValue,
                'type',
                context
              )
            }
          },
          name: {
            use: (
              fhirBundle: ITemplatedBundle,
              fieldValue: string,
              context: any
            ) => {
              const person = selectOrCreateCollectorPersonResource(
                fhirBundle,
                context,
                context.event
              )
              setObjectPropInResourceArray(
                person,
                'name',
                fieldValue,
                'use',
                context
              )
            },
            firstNames: (
              fhirBundle: ITemplatedBundle,
              fieldValue: string,
              context: any
            ) => {
              const person = selectOrCreateCollectorPersonResource(
                fhirBundle,
                context,
                context.event
              )
              setObjectPropInResourceArray(
                person,
                'name',
                fieldValue.split(' '),
                'given',
                context
              )
            },
            familyName: (
              fhirBundle: ITemplatedBundle,
              fieldValue: string,
              context: any
            ) => {
              const person = selectOrCreateCollectorPersonResource(
                fhirBundle,
                context,
                context.event
              )
              setObjectPropInResourceArray(
                person,
                'name',
                [fieldValue],
                'family',
                context
              )
            }
          }
        }
      },
      hasShowedVerifiedDocument: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          EVENT_TYPE.BIRTH
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) =>
            extention.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      payments: {
        paymentId: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH
          )
          if (!paymentResource.identifier) {
            paymentResource.identifier = []
          }
          paymentResource.identifier.push({
            system: `${OPENCRVS_SPECIFICATION_URL}id/payment-id`,
            value: fieldValue
          })
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                type: {
                  coding: [{ code: fieldValue }]
                }
              }
            ]
          } else {
            paymentResource.detail[0].type = {
              coding: [{ code: fieldValue }]
            }
          }
        },
        total: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH
          )
          paymentResource.total = fieldValue as fhir.Money
        },
        amount: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                amount: fieldValue as fhir.Money
              }
            ]
          } else {
            paymentResource.detail[0].amount = fieldValue as fhir.Money
          }
        },
        outcome: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH
          )
          paymentResource.outcome = {
            coding: [{ code: fieldValue }]
          }
        },
        date: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            EVENT_TYPE.BIRTH
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                date: fieldValue
              }
            ]
          } else {
            paymentResource.detail[0].date = fieldValue
          }
        }
      },
      data: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          EVENT_TYPE.BIRTH
        )
        if (!certDocResource.content) {
          certDocResource.content = [
            {
              attachment: {
                contentType: 'application/pdf'
              }
            }
          ]
        }
        certDocResource.content[0].attachment.data = fieldValue
      }
    }
  },
  eventLocation: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const encounterLocationRef = selectOrCreateEncounterLocationRef(
        fhirBundle,
        context
      )
      encounterLocationRef.reference = `Location/${fieldValue}`
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      let location
      if (context.event === EVENT_TYPE.BIRTH) {
        location = selectOrCreateLocationRefResource(
          BIRTH_ENCOUNTER_CODE,
          fhirBundle,
          context
        )
      } else {
        location = selectOrCreateLocationRefResource(
          DEATH_ENCOUNTER_CODE,
          fhirBundle,
          context
        )
      }
      location.type = {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
            code: fieldValue
          }
        ]
      }
    },
    partOf: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      location.partOf = {
        reference: fieldValue
      }
    },
    address: createLocationAddressBuilder(BIRTH_ENCOUNTER_CODE)
  },
  medicalPractitioner: {
    name: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const practitioner = selectOrCreateEncounterPartitioner(
        fhirBundle,
        context
      )
      practitioner.name = [
        {
          use: 'en',
          family: `${fieldValue}`
        }
      ]
    },
    qualification: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const practitioner = selectOrCreateEncounterPartitioner(
        fhirBundle,
        context
      )
      practitioner.qualification = [
        {
          code: {
            coding: [
              {
                system: `${OPENCRVS_SPECIFICATION_URL}practitioner-degree`,
                code: fieldValue
              }
            ]
          }
        }
      ]
    },
    lastVisitDate: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const encounterParticipant = selectOrCreateEncounterParticipant(
        fhirBundle,
        context
      ) as fhir.EncounterParticipant
      if (!encounterParticipant.period) {
        encounterParticipant.period = {}
      }
      encounterParticipant.period.start = fieldValue
    }
  },

  maleDependentsOfDeceased: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      MALE_DEPENDENTS_ON_DECEASED_CODE,
      'Number of male dependents on Deceased',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue as string
  },
  femaleDependentsOfDeceased: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      FEMALE_DEPENDENTS_ON_DECEASED_CODE,
      'Number of female dependents on Deceased',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue as string
  },
  birthType: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      BIRTH_TYPE_CODE,
      'Birth plurality of Pregnancy',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  weightAtBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      BODY_WEIGHT_CODE,
      'Body weight Measured',
      fhirBundle,
      context
    )
    observation.valueQuantity = {
      value: fieldValue,
      unit: 'kg',
      system: 'http://unitsofmeasure.org',
      code: 'kg'
    }
  },
  attendantAtBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      BIRTH_ATTENDANT_CODE,
      'Birth attendant title',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue
  },
  birthRegistrationType: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      BIRTH_REG_TYPE_CODE,
      'Birth registration type',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue
  },
  presentAtBirthRegistration: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      BIRTH_REG_PRESENT_CODE,
      'Present at birth registration',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue
  },
  primaryCaregiver: {
    primaryCaregiver: {
      _fhirID: (fhirBundle, fieldValue) => {
        const primaryCaregiver = selectOrCreatePersonResource(
          PRIMARY_CAREGIVER_CODE,
          PRIMARY_CAREGIVER_TITLE,
          fhirBundle
        )
        primaryCaregiver.id = fieldValue as string
      },
      name: createNameBuilder(PRIMARY_CAREGIVER_CODE, PRIMARY_CAREGIVER_TITLE),
      identifier: createIDBuilder(
        PRIMARY_CAREGIVER_CODE,
        PRIMARY_CAREGIVER_TITLE
      ),
      telecom: createTelecomBuilder(
        PRIMARY_CAREGIVER_CODE,
        PRIMARY_CAREGIVER_TITLE
      )
    },
    reasonsNotApplying: {
      primaryCaregiverType: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          PRIMARY_CAREGIVER,
          'Primary caregiver',
          fhirBundle,
          context
        )

        observation.valueString = fieldValue
        setPrimaryCaregiverReference(
          PRIMARY_CAREGIVER_CODE,
          observation,
          fhirBundle
        )
      },
      reasonNotApplying: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        if (fieldValue) {
          const primaryCaregiverObservation = selectObservationResource(
            PRIMARY_CAREGIVER,
            fhirBundle
          )
          const type =
            (primaryCaregiverObservation &&
              primaryCaregiverObservation.valueString) ||
            PRIMARY_CAREGIVER
          const codeAndDesc = getReasonCodeAndDesc(type)
          const observation = selectOrCreateObservationResource(
            BIRTH_ENCOUNTER_CODE,
            OBSERVATION_CATEGORY_PROCEDURE_CODE,
            OBSERVATION_CATEGORY_PROCEDURE_DESC,
            codeAndDesc.code,
            codeAndDesc.desc,
            fhirBundle,
            context
          )

          observation.valueString = fieldValue
          setPrimaryCaregiverReference(
            PRIMARY_CAREGIVER_CODE,
            observation,
            fhirBundle
          )
        }
      },
      isDeceased: (
        fhirBundle: ITemplatedBundle,
        fieldValue: boolean,
        context: any
      ) => {
        if (fieldValue) {
          const primaryCaregiverObservation = selectObservationResource(
            PRIMARY_CAREGIVER,
            fhirBundle
          )
          const type =
            (primaryCaregiverObservation &&
              primaryCaregiverObservation.valueString) ||
            PRIMARY_CAREGIVER
          const codeAndDesc = getReasonCodeAndDesc(type)
          const observation = selectOrCreateObservationResource(
            BIRTH_ENCOUNTER_CODE,
            OBSERVATION_CATEGORY_PROCEDURE_CODE,
            OBSERVATION_CATEGORY_PROCEDURE_DESC,
            codeAndDesc.code,
            codeAndDesc.desc,
            fhirBundle,
            context
          )

          observation.valueString = 'DECEASED'
          setPrimaryCaregiverReference(
            PRIMARY_CAREGIVER_CODE,
            observation,
            fhirBundle
          )
        }

        removeObservationResource(PRIMARY_CAREGIVER, fhirBundle)
      }
    },
    parentDetailsType: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const observation = selectOrCreateObservationResource(
        BIRTH_ENCOUNTER_CODE,
        OBSERVATION_CATEGORY_PROCEDURE_CODE,
        OBSERVATION_CATEGORY_PROCEDURE_DESC,
        PARENT_DETAILS,
        'Parent details',
        fhirBundle,
        context
      )

      observation.valueString = fieldValue
    }
  },
  childrenBornAliveToMother: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      NUMBER_BORN_ALIVE_CODE,
      'Number born alive to mother',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  foetalDeathsToMother: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      NUMBER_FOEATAL_DEATH_CODE,
      'Number foetal deaths to mother',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  lastPreviousLiveBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      LAST_LIVE_BIRTH_CODE,
      'Date last live birth',
      fhirBundle,
      context
    )
    observation.valueDateTime = fieldValue
  },
  mannerOfDeath: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      MANNER_OF_DEATH_CODE,
      'Uncertified manner of death',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/icd-10',
          code: fieldValue
        }
      ]
    }
  },
  causeOfDeathMethod: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      CAUSE_OF_DEATH_METHOD_CODE,
      'Cause of death method',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/icd-10',
          code: fieldValue
        }
      ]
    }
  },
  causeOfDeath: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      CAUSE_OF_DEATH_CODE,
      'Cause of death',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/icd-10',
          code: fieldValue
        }
      ]
    }
  }
}

export async function buildFHIRBundle(
  reg: object,
  eventType: EVENT_TYPE,
  authHeader: IAuthHeader
) {
  const ref = uuid()
  const context: any = {
    event: eventType
  }
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [createCompositionTemplate(ref, context)]
  }

  if (authHeader) {
    context.authHeader = authHeader
  }
  await transformObj(reg, fhirBundle, builders, context)
  return fhirBundle
}

export async function updateFHIRTaskBundle(
  taskEntry: ITaskBundleEntry,
  status: string,
  reason?: string,
  comment?: string
) {
  const taskResource = taskEntry.resource
  taskEntry.resource = updateTaskTemplate(taskResource, status, reason, comment)
  const fhirBundle: ITaskBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry]
  }
  return fhirBundle
}

export function addOrUpdateExtension(
  taskEntry: ITaskBundleEntry,
  extension: fhir.Extension,
  code: 'downloaded' | 'reinstated'
) {
  const task = taskEntry.resource

  if (!task.extension) {
    task.extension = []
  }

  const previousExtension = findExtension(extension.url, task.extension)

  if (!previousExtension) {
    task.extension.push(extension)
  } else {
    previousExtension.valueString = extension.valueString
  }

  taskEntry.request = {
    method: 'PUT',
    url: `Task/${taskEntry.resource.id}`
  } as fhir.BundleEntryRequest

  const fhirBundle: ITaskBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry],
    signature: {
      type: [
        {
          code
        }
      ],
      when: Date().toString()
    }
  }
  return fhirBundle
}

export interface ITemplatedComposition extends fhir.Composition {
  section: fhir.CompositionSection[]
  [key: string]: any
}

export interface ICompositionBundleEntry extends fhir.BundleEntry {
  resource: ITemplatedComposition
}

export interface ITemplatedBundle extends fhir.Bundle {
  resourceType: fhir.code
  // prettier-ignore
  entry: [ICompositionBundleEntry, ...fhir.BundleEntry[]]
}

export interface ITaskBundleEntry extends fhir.BundleEntry {
  resource: fhir.Task
}

export interface ITaskBundle extends fhir.Bundle {
  resourceType: fhir.code
  // prettier-ignore
  entry: [ITaskBundleEntry]
}
