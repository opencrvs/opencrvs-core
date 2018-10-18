import transformObj, { IFieldBuilders } from 'src/features/transformation'
import {
  createCompositionTemplate,
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import {
  selectOrCreatePersonResource,
  createAndSetProperty
  // createAndSetExtensionProperty
} from 'src/features/fhir/utils'

function createNameBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(
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
      createAndSetProperty(person, 'name', [fieldValue], 'family', context)
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
      createAndSetProperty(person, 'identifier', fieldValue, 'id', context)
    },
    type: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'identifier', fieldValue, 'type', context)
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
      createAndSetProperty(person, 'telecom', fieldValue, 'system', context)
    },
    value: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'telecom', fieldValue, 'value', context)
    },
    use: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'telecom', fieldValue, 'use', context)
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
      createAndSetProperty(person, 'photo', fieldValue, 'contentType', context)
    },
    data: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'photo', fieldValue, 'data', context)
    },
    title: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'photo', fieldValue, 'title', context)
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
      createAndSetProperty(person, 'address', fieldValue, 'use', context)
    },
    type: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'type', context)
    },
    text: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'text', context)
    },
    line: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      console.log('context', context)
      if (!person.address[context[`_index_for_address`]].line) {
        person.address[context[`_index_for_address`]].line = []
      }
      person.address[context[`_index_for_address`]].line.push(fieldValue)

      /*if (!person.address[context._index.address].line) {
        person.address[context._index.address].line = []
      }
      person.address[context._index.address].line.push(fieldValue)*/
    },
    city: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'city', context)
    },
    district: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'district', context)
    },
    state: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'state', context)
    },
    postalCode: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'postalCode', context)
    },
    country: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetProperty(person, 'address', fieldValue, 'country', context)
    }
  }
}

/* function createDateOfMarriageBuilder(sectionCode: string) {
  return {
    system: (fhirBundle: any, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        fhirBundle,
        context
      )
      createAndSetExtensionProperty(
        person,
        'extension',
        fieldValue,
        'dateOfMarriage',
        context
      )
    }
  }
} */

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
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        fhirBundle,
        context
      )
      mother.maritalStatus = fieldValue
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
    }
    // nationality: createNationalityBuilder(MOTHER_CODE),
    // dateOfMarriage: createDateOfMarriageBuilder(MOTHER_CODE)
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
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        fhirBundle,
        context
      )
      father.maritalStatus = fieldValue
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
    }
    // nationality: createNationalityBuilder(FATHER_CODE),
    // dateOfMarriage: createDateOfMarriageBuilder(FATHER_CODE)
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
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        fhirBundle,
        context
      )
      child.maritalStatus = fieldValue
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
    }
    // nationality: createNationalityBuilder(CHILD_CODE),
    // dateOfMarriage: createDateOfMarriageBuilder(CHILD_CODE)
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
