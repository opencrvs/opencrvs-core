import transformObj, { IFieldBuilders } from 'src/features/transformation'
import { v4 as uuid } from 'uuid'
import {
  createCompositionTemplate,
  updateTaskTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  BIRTH_ENCOUNTER_CODE,
  BIRTH_TYPE_CODE,
  DOCS_CODE,
  BODY_WEIGHT_CODE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_REG_TYPE_CODE,
  BIRTH_REG_PRESENT_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE,
  LAST_LIVE_BIRTH_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_DESC,
  OBSERVATION_CATEGORY_VSIGN_CODE,
  OBSERVATION_CATEGORY_VSIGN_DESC
} from 'src/features/fhir/templates'
import {
  selectOrCreateEncounterResource,
  selectOrCreateObservationResource,
  selectOrCreatePersonResource,
  selectOrCreateDocRefResource,
  selectOrCreateLocationRefResource,
  setObjectPropInResourceArray,
  getMaritalStatusCode,
  selectOrCreateTaskRefResource
} from 'src/features/fhir/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  FHIR_SPECIFICATION_URL
} from '../fhir/constants'

function createNameBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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

function createIDBuilder(sectionCode: string) {
  return {
    id: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'id',
        context
      )
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'type',
        context
      )
    }
  }
}

function createTelecomBuilder(sectionCode: string) {
  return {
    system: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'system',
        context
      )
    },
    value: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'value',
        context
      )
    },
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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

function createPhotoBuilder(sectionCode: string) {
  return {
    contentType: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'photo',
        fieldValue,
        'contentType',
        context
      )
    },
    data: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(person, 'photo', fieldValue, 'data', context)
    },
    title: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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

function createAddressBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'use',
        context
      )
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'type',
        context
      )
    },
    text: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'text',
        context
      )
    },
    line: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'district',
        context
      )
    },
    state: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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
      const person = selectOrCreatePersonResource(sectionCode, fhirBundle)
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

function createPaperFormID(resource: fhir.Task, fieldValue: string) {
  if (!resource.identifier) {
    resource.identifier = []
  }
  resource.identifier.push({
    system: `${OPENCRVS_SPECIFICATION_URL}id/paper-form-id`,
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

const builders: IFieldBuilders = {
  _fhirIDMap: {
    composition: (fhirBundle, fieldValue) => {
      fhirBundle.entry[0].resource.id = fieldValue as string
    },
    encounter: (fhirBundle, fieldValue) => {
      const encounter = selectOrCreateEncounterResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle
      )
      encounter.id = fieldValue as string
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
  createdAt: (fhirBundle, fieldValue) => {
    if (!fhirBundle.meta) {
      fhirBundle.meta = {}
    }
    fhirBundle.meta.lastUpdated = fieldValue
    fhirBundle.entry[0].resource.date = fieldValue
  },
  mother: {
    _fhirID: (fhirBundle, fieldValue) => {
      const mother = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      mother.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      mother.gender = fieldValue as string
    },
    identifier: createIDBuilder(MOTHER_CODE),
    name: createNameBuilder(MOTHER_CODE),
    telecom: createTelecomBuilder(MOTHER_CODE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      mother.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      mother.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(MOTHER_CODE),
    photo: createPhotoBuilder(MOTHER_CODE),
    deceased: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      mother.deceasedBoolean = fieldValue as boolean
    },
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(MOTHER_CODE, fhirBundle)
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  father: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      father.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      father.gender = fieldValue as string
    },
    identifier: createIDBuilder(FATHER_CODE),
    name: createNameBuilder(FATHER_CODE),
    telecom: createTelecomBuilder(FATHER_CODE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      father.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      father.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(FATHER_CODE),
    photo: createPhotoBuilder(FATHER_CODE),
    deceased: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      father.deceasedBoolean = fieldValue as boolean
    },

    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(FATHER_CODE, fhirBundle)
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  child: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      child.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      child.gender = fieldValue as string
    },
    identifier: createIDBuilder(CHILD_CODE),
    name: createNameBuilder(CHILD_CODE),
    telecom: createTelecomBuilder(CHILD_CODE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      child.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      child.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(CHILD_CODE),
    photo: createPhotoBuilder(CHILD_CODE),
    deceased: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      child.deceasedBoolean = fieldValue as boolean
    },

    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(CHILD_CODE, fhirBundle)
      return createEducationalAttainmentBuilder(person, fieldValue)
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
    paperFormID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createPaperFormID(taskResource, fieldValue)
    },
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
      timestamp: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        taskResource.lastModified = fieldValue
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
          DOCS_CODE,
          fhirBundle,
          context
        )
        docRef.id = fieldValue as string
      },
      originalFileName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
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
          DOCS_CODE,
          fhirBundle,
          context
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
          DOCS_CODE,
          fhirBundle,
          context
        )
        docRef.docStatus = fieldValue
      },
      type: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
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
          DOCS_CODE,
          fhirBundle,
          context
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
          DOCS_CODE,
          fhirBundle,
          context
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
          DOCS_CODE,
          fhirBundle,
          context
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
          DOCS_CODE,
          fhirBundle,
          context
        )
        if (!docRef.subject) {
          docRef.subject = {}
        }
        docRef.subject.display = fieldValue
      }
    }
  },
  birthLocation: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        fieldValue
      )
      location.id = fieldValue as string
    },
    status: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        fieldValue
      )
      location.status = fieldValue
    },
    name: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      location.name = fieldValue
    },
    latitude: (
      fhirBundle: ITemplatedBundle,
      fieldValue: number,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      if (!location.position) {
        location.position = { latitude: 0, longitude: 0 }
      }
      location.position.latitude = fieldValue
    },
    longitude: (
      fhirBundle: ITemplatedBundle,
      fieldValue: number,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      if (!location.position) {
        location.position = { latitude: 0, longitude: 0 }
      }
      location.position.longitude = fieldValue
    }
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
  }
}

export async function buildFHIRBundle(reg: object) {
  const ref = uuid()
  const fhirBundle: ITemplatedBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [createCompositionTemplate(ref)]
  }

  await transformObj(reg, fhirBundle, builders)
  return fhirBundle
}

export async function updateFHIRTaskBundle(
  taskEntry: ITaskBundleEntry,
  status: string,
  reason?: string,
  comment?: string
) {
  const taskResource = taskEntry.resource as fhir.Task
  taskEntry.resource = updateTaskTemplate(taskResource, status, reason, comment)
  const fhirBundle: ITaskBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry]
  }
  return fhirBundle
}

export interface ITemplatedComposition extends fhir.Composition {
  section: fhir.CompositionSection[]
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
