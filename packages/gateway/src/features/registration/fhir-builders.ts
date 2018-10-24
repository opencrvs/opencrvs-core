import transformObj, { IFieldBuilders } from 'src/features/transformation'
import { v4 as uuid } from 'uuid'
import {
  createCompositionTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  BIRTH_ENCOUNTER_CODE
} from 'src/features/fhir/templates'
import {
  selectOrCreatePersonResource,
  setObjectPropInResourceArray,
  selectOrCreateLocation,
  getMaritalStatusCode
} from 'src/features/fhir/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  FHIR_SPECIFICATION_URL
} from '../fhir/constants'

function createNameBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (fhirBundle: any, fieldValue: string, context: any) => {
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
    familyName: (fhirBundle: any, fieldValue: string, context: any) => {
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
    id: (fhirBundle: any, fieldValue: string, context: any) => {
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
    type: (fhirBundle: any, fieldValue: string, context: any) => {
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

function createLocationIDBuilder(sectionCode: string) {
  return {
    id: (fhirBundle: any, fieldValue: string, context: any) => {
      const encounter = selectOrCreateLocation(sectionCode, fhirBundle, context)
      setObjectPropInResourceArray(
        encounter.location,
        'identifier',
        fieldValue,
        'id',
        context
      )
    },
    type: (fhirBundle: any, fieldValue: string, context: any) => {
      const encounter = selectOrCreateLocation(sectionCode, fhirBundle, context)
      setObjectPropInResourceArray(
        encounter.location,
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
    system: (fhirBundle: any, fieldValue: string, context: any) => {
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
    value: (fhirBundle: any, fieldValue: string, context: any) => {
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
    use: (fhirBundle: any, fieldValue: string, context: any) => {
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
    contentType: (fhirBundle: any, fieldValue: string, context: any) => {
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
    data: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      setObjectPropInResourceArray(person, 'photo', fieldValue, 'data', context)
    },
    title: (fhirBundle: any, fieldValue: string, context: any) => {
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
    use: (fhirBundle: any, fieldValue: string, context: any) => {
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
    type: (fhirBundle: any, fieldValue: string, context: any) => {
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
    text: (fhirBundle: any, fieldValue: string, context: any) => {
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
    line: (fhirBundle: any, fieldValue: string, context: any) => {
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
    city: (fhirBundle: any, fieldValue: string, context: any) => {
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
    district: (fhirBundle: any, fieldValue: string, context: any) => {
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
    state: (fhirBundle: any, fieldValue: string, context: any) => {
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
    postalCode: (fhirBundle: any, fieldValue: string, context: any) => {
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
    country: (fhirBundle: any, fieldValue: string, context: any) => {
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

function createDateOfMarriageBuilder(resource: any, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}date-of-marriage`,
    valueDateTime: fieldValue
  })
}

function createNationalityBuilder(resource: any, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
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

function createMaritalStatusBuilder(resource: any, fieldValue: string) {
  resource.maritalStatus = {
    coding: {
      system: `${FHIR_SPECIFICATION_URL}marital-status`,
      code: getMaritalStatusCode(fieldValue)
    },
    text: fieldValue
  }
}

function createEducationalAttainmentBuilder(resource: any, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}educational-attainment`,
    valueString: fieldValue
  })
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
    nationality: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: any,
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

    nationality: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: any,
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

    nationality: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: any,
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
  birthLocation: {
    identifier: createLocationIDBuilder(BIRTH_ENCOUNTER_CODE),
    status: (fhirBundle: any, fieldValue: string, context: any) => {
      const location = selectOrCreateLocation(
        BIRTH_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      location.status = fieldValue
    }
    // Need to add more properties
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
