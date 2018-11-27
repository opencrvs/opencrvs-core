import { generateBirthRegistrationNumber } from './index'
import { pushTrackingId } from '../fhir/fhir-bundle-modifier'
import { testFhirBundle } from 'src/test/utils'

describe('Verify generateBirthRegistrationNumber', () => {
  const tokenPayload = {
    iss: '',
    iat: 1541576965,
    exp: 1573112965,
    aud: '',
    subject: '1',
    scope: ['register']
  }
  it('Generate BD BRN properly', () => {
    const brn = generateBirthRegistrationNumber(
      pushTrackingId(testFhirBundle),
      tokenPayload
    )
    expect(brn).toBeDefined()
    expect(brn.length).toBe(12)
  })
  it('Throws error for default BRN generator', () => {
    expect(() =>
      generateBirthRegistrationNumber(testFhirBundle, tokenPayload, 'default')
    ).toThrowError('Default BRN generator has not been impleted yet')
  })
})
