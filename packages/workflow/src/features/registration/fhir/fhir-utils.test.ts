import { testFhirBundle } from 'src/test/utils'
import {
  getSharedContactMsisdn,
  getInformantName,
  getTrackingId,
  getBirthRegistrationNumber,
  getRegStatusCode
} from './fhir-utils'
import { pushTrackingId, pushBRN } from './fhir-bundle-modifier'
import { cloneDeep } from 'lodash'

describe('Verify getSharedContactMsisdn', () => {
  it('Returned shared contact number properly', () => {
    const phoneNumber = getSharedContactMsisdn(testFhirBundle)
    expect(phoneNumber).toEqual('+8801622688231')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getSharedContactMsisdn({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('Invalid FHIR bundle found for declaration')
  })

  it('Throws error when invalid shared contact info given', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension[0].valueString = 'INVALID'
    expect(() => getSharedContactMsisdn(fhirBundle)).toThrowError(
      "Invalid Informant's shared contact information found"
    )
  })

  it('Throws error when telecom is missing for shared contact', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension[0].valueString = 'FATHER'
    expect(() => getSharedContactMsisdn(fhirBundle)).toThrowError(
      "Didn't find any contact point for informant's shared contact"
    )
  })

  it('Throws error when phonenumber is missing for shared contact', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[3].resource.telecom = []
    expect(() => getSharedContactMsisdn(fhirBundle)).toThrowError(
      "Didn't find any phone number for informant's shared contact"
    )
  })
})

describe('Verify getInformantName', () => {
  it('Returned informant name properly', () => {
    const informantName = getInformantName(testFhirBundle)
    expect(informantName).toEqual('অনিক অনিক')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getInformantName({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError(
      'getInformantName: Invalid FHIR bundle found for declaration'
    )
  })

  it('Throws error when child name section is missing', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = undefined
    expect(() => getInformantName(fhirBundle)).toThrowError(
      "Didn't find informant's name information"
    )
  })

  it("Throws error when child's bn name block is missing", () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = []
    expect(() => getInformantName(fhirBundle)).toThrowError(
      "Didn't found informant's bn name"
    )
  })
})

describe('Verify getTrackingId', () => {
  it('Returned tracking id properly', () => {
    const trackingid = getTrackingId(pushTrackingId(testFhirBundle))
    expect(trackingid).toMatch(/^B/)
    expect(trackingid.length).toBe(7)
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getTrackingId({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('getTrackingId: Invalid FHIR bundle found for declaration')
  })
})

describe('Verify getBirthRegistrationNumber', () => {
  it('Returned birth registration number properly', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: ['register']
    }
    const brn = getBirthRegistrationNumber(
      pushBRN(testFhirBundle, tokenPayload)
    )

    expect(brn).toBeDefined()
    expect(brn).toMatch(new RegExp(`^${new Date().getFullYear()}12345678`))
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getBirthRegistrationNumber({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError("Didn't find any identifier for birth registration number")
  })
})

describe('Verify getRegStatusCode', () => {
  it('Returned right registration status based on token scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: ['register']
    }
    const regStatus = getRegStatusCode(tokenPayload)
    expect(regStatus).toBeDefined()
    expect(regStatus).toBe('REGISTERED')
  })

  it('Throws error when invalid token has no scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1'
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No scope found on token'
    )
  })

  it('Throws error when invalid token scope is provided', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: ['invalid']
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No valid scope found on token'
    )
  })
})
