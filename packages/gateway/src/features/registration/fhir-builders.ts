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
  setArrayPropInResourceObject
} from 'src/features/fhir/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  FHIR_SPECIFICATION_URL,
  FHIR_OBSERVATION_CATEGORY_URL
} from '../fhir/constants'

function createNameBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'name',
        fieldValue.split(' '),
        'given',
        context
      )
    },
    familyName: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
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

function createIDBuilder(sectionCode: string) {
  return {
    id: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'id',
        context
      )
    },
    type: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
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
    system: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'system',
        context
      )
    },
    value: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'value',
        context
      )
    },
    use: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
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

function createPhotoBuilder(sectionCode: string) {
  return {
    contentType: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'photo',
        fieldValue,
        'contentType',
        context
      )
    },
    data: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(person, 'photo', fieldValue, 'data', context)
    },
    title: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
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

function createAddressBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'use',
        context
      )
    },
    type: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'type',
        context
      )
    },
    text: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'text',
        context
      )
    },
    line: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!person.address[context._index.address].line) {
        person.address[context._index.address].line = []
      }
      person.address[context._index.address].line.push(fieldValue)
    },
    city: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'city',
        context
      )
    },
    district: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'district',
        context
      )
    },
    state: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'state',
        context
      )
    },
    postalCode: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'postalCode',
        context
      )
    },
    country: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
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

function createDateOfMarriageBuilder(
  resource: fhir.Resource,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}date-of-marriage`,
    valueDateTime: fieldValue
  })
}

function createNationalityBuilder(resource: fhir.Resource, fieldValue: string) {
  !resource.extension && (resource.extension = [])

  resource.extension.push({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: { system: 'urn:iso:std:iso:3166', code: fieldValue }
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
  resource: fhir.Resource,
  fieldValue: string
) {
  resource.maritalStatus = {
    coding: {
      system: `${FHIR_SPECIFICATION_URL}marital-status`,
      code: getMaritalStatusCode(fieldValue)
    },
    text: fieldValue
  }
}

function createEducationalAttainmentBuilder(
  resource: fhir.Resource,
  fieldValue: string
) {
  !resource.extension && (resource.extension = [])

  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}educational-attainment`,
    valueString: fieldValue
  })
}

function createBirthTypeBuilder(resource: fhir.Resource, fieldValue: number) {
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
  resource.valueInteger = fieldValue
}

function createBirthWeightBuilder(resource: fhir.Resource, fieldValue: number) {
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
  resource: fhir.Resource,
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
  resource: fhir.Resource,
  fieldValue: string
) {
  const coding = [
    {
      system: 'http://opencrvs.org/specs/obs-type',
      code: BIRTH_REG_TYPE_CODE,
      display: 'Birth registration type'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueString = fieldValue
}

function createPresentAtBirthBuilder(
  resource: fhir.Resource,
  fieldValue: string
) {
  const coding = [
    {
      system: 'http://opencrvs.org/specs/obs-type',
      code: BIRTH_REG_PRESENT_CODE,
      display: 'Present at birth registration'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueString = fieldValue
}

function createChildrenBornAliveToMotherBuilder(
  resource: fhir.Resource,
  fieldValue: number
) {
  const coding = [
    {
      system: 'http://opencrvs.org/specs/obs-type',
      code: NUMBER_BORN_ALIVE_CODE,
      display: 'Number born alive to mother'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueInteger = fieldValue
}

function createNumberFoetalDeathsToMotherBuilder(
  resource: fhir.Resource,
  fieldValue: number
) {
  const coding = [
    {
      system: 'http://opencrvs.org/specs/obs-type',
      code: NUMBER_FOEATAL_DEATH_CODE,
      display: 'Number foetal deaths to mother'
    }
  ]
  setArrayPropInResourceObject(resource, 'code', coding, 'coding')
  resource.valueInteger = fieldValue
}

function createLastPreviousLiveBirthBuilder(
  resource: fhir.Resource,
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
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      mother.gender = fieldValue
    },
    identifier: createIDBuilder(MOTHER_CODE),
    name: createNameBuilder(MOTHER_CODE),
    telecom: createTelecomBuilder(MOTHER_CODE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      mother.birthDate = fieldValue
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      return createMaritalStatusBuilder(person, fieldValue)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      mother.multipleBirthInteger = fieldValue
    },
    address: createAddressBuilder(MOTHER_CODE),
    photo: createPhotoBuilder(MOTHER_CODE),
    deceased: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      mother.deceasedBoolean = fieldValue
    },
    nationality: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  father: {
    gender: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      father.gender = fieldValue
    },
    identifier: createIDBuilder(FATHER_CODE),
    name: createNameBuilder(FATHER_CODE),
    telecom: createTelecomBuilder(FATHER_CODE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      father.birthDate = fieldValue
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      return createMaritalStatusBuilder(person, fieldValue)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      father.multipleBirthInteger = fieldValue
    },
    address: createAddressBuilder(FATHER_CODE),
    photo: createPhotoBuilder(FATHER_CODE),
    deceased: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      father.deceasedBoolean = fieldValue
    },

    nationality: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  child: {
    gender: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      child.gender = fieldValue
    },
    identifier: createIDBuilder(CHILD_CODE),
    name: createNameBuilder(CHILD_CODE),
    telecom: createTelecomBuilder(CHILD_CODE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      child.birthDate = fieldValue
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      return createMaritalStatusBuilder(person, fieldValue)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      child.multipleBirthInteger = fieldValue
    },
    address: createAddressBuilder(CHILD_CODE),
    photo: createPhotoBuilder(CHILD_CODE),
    deceased: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      child.deceasedBoolean = fieldValue
    },

    nationality: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: fhir.Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  registration: {
    attachments: {
      originalFileName: (
        fhirBundle: fhir.Bundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        !docRef.identifier && (docRef.identifier = [])

        docRef.identifier.push({
          system: 'http://opencrvs.org/specs/id/original-file-name',
          value: fieldValue
        })
      },
      systemFileName: (
        fhirBundle: fhir.Bundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        !docRef.identifier && (docRef.identifier = [])

        docRef.identifier.push({
          system: 'http://opencrvs.org/specs/id/system-file-name',
          value: fieldValue
        })
      },
      status: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        docRef.docStatus = fieldValue
      },
      type: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        docRef.type = {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: fieldValue
            }
          ]
        }
      },
      createdAt: (
        fhirBundle: fhir.Bundle,
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
        fhirBundle: fhir.Bundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        !docRef.content &&
          (docRef.content = {
            attachment: {}
          })
        docRef.content.attachment.contentType = fieldValue
      },
      data: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        !docRef.content &&
          (docRef.content = {
            attachment: {}
          })
        docRef.content.attachment.data = fieldValue
      }
    }
  },
  birthLocation: {
    status: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        fieldValue
      )
      location.status = fieldValue
    },
    name: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      location.name = fieldValue
    },
    latitude: (fhirBundle: fhir.Bundle, fieldValue: number, context: any) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      !location.position && (location.position = {})
      location.position.latitude = fieldValue
    },
    longitude: (fhirBundle: fhir.Bundle, fieldValue: number, context: any) => {
      const location = selectOrCreateLocationRefResource(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      !location.position && (location.position = {})
      location.position.longitude = fieldValue
    }
  },
  birthType: (fhirBundle: fhir.Bundle, fieldValue: number, context: any) => {
    const observation = createObservationResource(
      BIRTH_ENCOUNTER_CODE,
      fhirBundle,
      context
    )
    return createBirthTypeBuilder(observation, fieldValue)
  },
  weightAtBirth: (
    fhirBundle: fhir.Bundle,
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
    fhirBundle: fhir.Bundle,
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
    fhirBundle: fhir.Bundle,
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
    fhirBundle: fhir.Bundle,
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
    fhirBundle: fhir.Bundle,
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
    fhirBundle: fhir.Bundle,
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
    fhirBundle: fhir.Bundle,
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

export async function buildFHIRBundle(reg: any) {
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [createCompositionTemplate()]
  }

  await transformObj(reg, fhirBundle, builders)
  return fhirBundle
}
