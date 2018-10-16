import transformObj, { IFieldBuilders } from 'src/features/transformation'
import {
  createCompositionTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import {
  selectOrCreatePersonResource,
  createAndSetNameProperty,
  createAndSetIDProperty
} from 'src/features/fhir/utils'

function createNameBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetNameProperty(person, fieldValue, 'use', context)
    },
    firstNames: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetNameProperty(person, fieldValue.split(' '), 'given', context)
    },
    familyName: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetNameProperty(person, [fieldValue], 'family', context)
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
      createAndSetIDProperty(person, fieldValue, 'id', context)
    },
    type: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetIDProperty(person, fieldValue, 'type', context)
    }
  }
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
    name: createNameBuilder(MOTHER_CODE)
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
    name: createNameBuilder(FATHER_CODE)
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
    name: createNameBuilder(CHILD_CODE)
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
