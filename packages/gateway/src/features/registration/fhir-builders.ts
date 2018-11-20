import transformObj, { IFieldBuilders } from 'src/features/transformation'
import {
  createCompositionTemplate,
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
  LAST_LIVE_BIRTH_CODE
} from 'src/features/fhir/templates'
import {
  selectOrCreatePersonResource,
  selectOrCreateDocRefResource,
  selectOrCreateLocationRefResource,
  setObjectPropInResourceArray,
  getMaritalStatusCode,
  createObservationResource,
  setArrayPropInResourceObject,
  selectOrCreateTaskRefResource
} from 'src/features/fhir/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  FHIR_SPECIFICATION_URL,
  FHIR_OBSERVATION_CATEGORY_URL
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

function createRegStatusComment(resource: fhir.Task, fieldValue: string) {
  if (!resource.note) {
    resource.note = []
  }
  resource.note.push({
    text: fieldValue
  })
}

function createRegStatusCommentTimeStamp(
  resource: fhir.Task,
  fieldValue: string
) {
  const incompleteNote = resource.note && resource.note.find(note => !note.time)
  if (incompleteNote) {
    incompleteNote.time = fieldValue
  }
}

function createBirthTypeBuilder(
  resource: fhir.Observation,
  fieldValue: number
) {
  const categoryCoding = {
    coding: [
      {
        system: FHIR_OBSERVATION_CATEGORY_URL,
        code: 'procedure',
        display: 'Procedure'
      }
    ]
  }

  if (!resource.category) {
    resource.category = []
  }
  resource.category.push(categoryCoding)

  const coding = [
    {
      system: 'http://loinc.org',
      code: BIRTH_TYPE_CODE,
      display: 'Birth plurality of Pregnancy'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  if (!resource.valueQuantity) {
    resource.valueQuantity = {}
  }
  resource.valueQuantity.value = fieldValue
}

function createBirthWeightBuilder(
  resource: fhir.Observation,
  fieldValue: number
) {
  const categoryCoding = {
    coding: [
      {
        system: FHIR_OBSERVATION_CATEGORY_URL,
        code: 'vital-signs',
        display: 'Vital Signs'
      }
    ]
  }
  if (!resource.category) {
    resource.category = []
  }
  resource.category.push(categoryCoding)

  const coding = [
    {
      system: 'http://loinc.org',
      code: BODY_WEIGHT_CODE,
      display: 'Body weight Measured'
    }
  ]

  setArrayPropInResourceObject(resource, 'code', coding, 'coding')

  resource.valueQuantity = {
    value: fieldValue,
    unit: 'kg',
    system: 'http://unitsofmeasure.org',
    code: 'kg'
  }
}

function createBirthAttendantBuilder(
  resource: fhir.Observation,
  fieldValue: string
) {
  const categoryCoding = {
    coding: [
      {
        system: FHIR_OBSERVATION_CATEGORY_URL,
        code: 'procedure',
        display: 'Procedure'
      }
    ]
  }
  if (!resource.category) {
    resource.category = []
  }
  resource.category.push(categoryCoding)

  const coding = [
    {
      system: 'http://loinc.org',
      code: BIRTH_ATTENDANT_CODE,
      display: 'Birth attendant title'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueString = fieldValue
}

function createBirthRegTypeBuilder(
  resource: fhir.Observation,
  fieldValue: string
) {
  const coding = [
    {
      system: `${OPENCRVS_SPECIFICATION_URL}obs-type`,
      code: BIRTH_REG_TYPE_CODE,
      display: 'Birth registration type'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueString = fieldValue
}

function createPresentAtBirthBuilder(
  resource: fhir.Observation,
  fieldValue: string
) {
  const coding = [
    {
      system: `${OPENCRVS_SPECIFICATION_URL}obs-type`,
      code: BIRTH_REG_PRESENT_CODE,
      display: 'Present at birth registration'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueString = fieldValue
}

function createChildrenBornAliveToMotherBuilder(
  resource: fhir.Observation,
  fieldValue: number
) {
  const coding = [
    {
      system: `${OPENCRVS_SPECIFICATION_URL}obs-type`,
      code: NUMBER_BORN_ALIVE_CODE,
      display: 'Number born alive to mother'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  if (!resource.valueQuantity) {
    resource.valueQuantity = {}
  }
  resource.valueQuantity.value = fieldValue
}

function createNumberFoetalDeathsToMotherBuilder(
  resource: fhir.Observation,
  fieldValue: number
) {
  const coding = [
    {
      system: `${OPENCRVS_SPECIFICATION_URL}obs-type`,
      code: NUMBER_FOEATAL_DEATH_CODE,
      display: 'Number foetal deaths to mother'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  if (!resource.valueQuantity) {
    resource.valueQuantity = {}
  }
  resource.valueQuantity.value = fieldValue
}

function createLastPreviousLiveBirthBuilder(
  resource: fhir.Observation,
  fieldValue: string
) {
  const coding = [
    {
      system: 'http://loinc.org',
      code: LAST_LIVE_BIRTH_CODE,
      display: 'Date last live birth'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueDateTime = fieldValue
}

const builders: IFieldBuilders = {
  createdAt: (fhirBundle, fieldValue) => {
    if (!fhirBundle.meta) {
      fhirBundle.meta = {}
    }
    fhirBundle.meta.lastUpdated = fieldValue
    fhirBundle.entry[0].resource.date = fieldValue
  },
  mother: {
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
    contact: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareContact(taskResource, fieldValue)
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
          return createRegStatusComment(taskResource, fieldValue)
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
          return createRegStatusCommentTimeStamp(taskResource, fieldValue)
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
      }
    }
  },
  birthLocation: {
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
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createBirthTypeBuilder(observation, fieldValue)
  },
  weightAtBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createBirthWeightBuilder(observation, fieldValue)
  },
  attendantAtBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createBirthAttendantBuilder(observation, fieldValue)
  },
  birthRegistrationType: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createBirthRegTypeBuilder(observation, fieldValue)
  },
  presentAtBirthRegistration: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createPresentAtBirthBuilder(observation, fieldValue)
  },
  childrenBornAliveToMother: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createChildrenBornAliveToMotherBuilder(observation, fieldValue)
  },
  foetalDeathsToMother: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createNumberFoetalDeathsToMotherBuilder(observation, fieldValue)
  },
  lastPreviousLiveBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createLastPreviousLiveBirthBuilder(observation, fieldValue)
  }
}

export async function buildFHIRBundle(reg: object) {
  const fhirBundle: ITemplatedBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [createCompositionTemplate()]
  }

  await transformObj(reg, fhirBundle, builders)
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
