import {
  fieldToIdentityTransformer,
  nestedRadioFieldToBundleFieldTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import { IFormField } from '@register/forms'

describe('Mutation FieldMapping', () => {
  const factory = fieldToIdentityTransformer('id', 'nationalId')
  const expectedResult = {
    person: { identifier: [{ id: undefined, type: 'nationalId' }] }
  }
  const draftData = {
    person: {}
  }
  const sectionId = 'person'
  const field = {} as IFormField

  it('Should return valid data', () => {
    const transformedData = {
      person: {
        identifier: undefined
      }
    }

    const result = factory(
      transformedData,
      draftData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })

  it('Should return valid JSON for new identity', () => {
    const transformedData = {
      person: {
        identifier: [
          {
            type: 'nationalId'
          }
        ]
      }
    }

    const result = factory(
      transformedData,
      draftData,
      sectionId,
      field as IFormField
    )
    expect(result).toEqual(expectedResult)
  })

  describe('For nested fields', () => {
    const factory = nestedRadioFieldToBundleFieldTransformer()

    const draftData = {
      registration: {
        registrationPhone: {
          value: '01711111111'
        }
      }
    }

    const expectedResult = {
      registrationPhone: '01711111111'
    }

    const sectionId = 'registration'
    const field = { name: 'registrationPhone' } as IFormField

    it('should return a valid JSON for parent field having nested fields', () => {
      const transformedData = {
        registrationPhone: ''
      }

      const result = factory(
        transformedData,
        draftData,
        sectionId,
        field as IFormField
      )
      expect(result).toEqual(expectedResult)
    })
  })
})
