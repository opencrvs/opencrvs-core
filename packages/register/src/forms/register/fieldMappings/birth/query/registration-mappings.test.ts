import { changeHirerchyQueryTransformer } from '@register/forms/register/fieldMappings/birth/query/registration-mappings'
import { IFormField } from '@register/forms'

describe('registration query mappings tests', () => {
  it('changeHierarchyQueryTransformer test', () => {
    const queryData = {
      registration: {
        registrationPhone: '01711111111'
      }
    }

    const transformedData = {
      registration: {
        whoseContactDetails: {
          nestedFields: {}
        }
      }
    }

    const expectedTransformedData = {
      registration: {
        whoseContactDetails: {
          nestedFields: {
            registrationPhone: '01711111111'
          }
        }
      }
    }

    const field = {
      name: 'whoseContactDetails'
    } as IFormField

    changeHirerchyQueryTransformer()(
      transformedData,
      queryData,
      'registration',
      field,
      { name: 'registrationPhone' } as IFormField
    )

    expect(transformedData).toEqual(expectedTransformedData)
  })
})
