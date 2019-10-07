import { msisdnTransformer } from './user-mappings'
import { IFormField } from '@register/forms'

describe('user mapping tests', () => {
  it('msisdn transformer transforms phone number into msisdn format', () => {
    const transformedData = { user: {} }
    const draftData = { user: { mobile: '01612345678' } }
    const field = { name: 'mobile' } as IFormField

    const expectedTransformedData = {
      user: {
        mobile: '+8801612345678'
      }
    }
    msisdnTransformer()(transformedData, draftData, 'user', field)

    expect(transformedData).toEqual(expectedTransformedData)
  })
})
