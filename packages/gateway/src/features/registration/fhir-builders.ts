import transformObj, { IFieldBuilders } from 'src/features/transformation'
import {
  createCompositionTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  DOCS_CODE
} from 'src/features/fhir/templates'
import {
  selectOrCreatePersonResource,
  selectOrCreateDocRefResource,
  setObjectPropInResourceArray,
  getMaritalStatusCode
} from 'src/features/fhir/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  FHIR_SPECIFICATION_URL
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
        if (!docRef.identifier) {
          docRef.identifier = []
        }
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
        if (!docRef.identifier) {
          docRef.identifier = []
        }
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
        if (!docRef.content) {
          docRef.content = {
            attachment: {}
          }
        }
        docRef.content.attachment.contentType = fieldValue
      },
      data: (fhirBundle: fhir.Bundle, fieldValue: string, context: any) => {
        const docRef = selectOrCreateDocRefResource(
          DOCS_CODE,
          fhirBundle,
          context
        )
        if (!docRef.content) {
          docRef.content = {
            attachment: {}
          }
        }
        docRef.content.attachment.data = fieldValue
      }
    }
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
