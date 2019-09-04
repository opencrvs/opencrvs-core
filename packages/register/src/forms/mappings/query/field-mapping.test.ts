import { identityToFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import { IFormField } from '@register/forms'

describe('Query FieldMapping', () => {
  it('Should return valid data', () => {
    const factory = identityToFieldTransformer('id', 'nationalId')
    const expectedResult = {}
    const queryData = {
      person: {}
    }
    const sectionId = 'person'
    const field = {} as IFormField
    const transformedData = {}
    const result = factory(
      transformedData,
      queryData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })
})
