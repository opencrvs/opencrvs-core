import transformObj, { IFieldBuilders } from 'src/features/transformation'
import {
  createCompositionTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import {
  selectOrCreatePersonResource,
  createAndSetNameProperty
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
    givenName: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetNameProperty(person, [fieldValue], 'given', context)
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

const builders: IFieldBuilders = {
  createdAt: (fhirBundle, fieldValue) => {
    if (!fhirBundle.meta) {
      fhirBundle.meta = {}
    }
    fhirBundle.meta.lastUpdated = fieldValue
    fhirBundle.entry[0].resource.data = fieldValue
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
    name: createNameBuilder(CHILD_CODE)
  }
}

export async function toFHIR(reg: any) {
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [createCompositionTemplate()]
  }

  await transformObj(reg, fhirBundle, builders)
  return fhirBundle
}

export function fromFHIR(compositionBundle: any) {
  return compositionBundle.entry.map((compEntry: any) => {
    const motherResource = compEntry.resource.section.find(
      (section: any) => section.code.coding.code === 'mother-details'
    ).entry[0].resource
    const fatherResource = compEntry.resource.section.find(
      (section: any) => section.code.coding.code === 'father-details'
    ).entry[0].resource
    const childResource = compEntry.resource.section.find(
      (section: any) => section.code.coding.code === 'child-details'
    ).entry[0].resource

    return {
      id: compEntry.resource.id,
      mother: {
        gender: motherResource.gender,
        name: motherResource.name.map((name: any) => {
          return {
            givenName: name.given[0],
            familyName: name.family[0]
          }
        })
      },
      father: {
        gender: fatherResource.gender,
        name: fatherResource.name.map((name: any) => {
          return {
            givenName: name.given[0],
            familyName: name.family[0]
          }
        })
      },
      child: {
        gender: childResource.gender,
        name: childResource.name.map((name: any) => {
          return {
            givenName: name.given[0],
            familyName: name.family[0]
          }
        })
      },
      createdAt: compEntry.resource.date
    }
  })
}
