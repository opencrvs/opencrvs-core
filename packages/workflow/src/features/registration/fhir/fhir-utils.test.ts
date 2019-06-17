import { testFhirBundle, testFhirTaskBundle } from '@workflow/test/utils'
import {
  getSharedContactMsisdn,
  getInformantName,
  getTrackingId,
  getEntryId,
  getBirthRegistrationNumber,
  getRegStatusCode,
  getPaperFormID
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  setTrackingId,
  pushRN
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { cloneDeep } from 'lodash'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify getSharedContactMsisdn', () => {
  it('Returned shared contact number properly', async () => {
    const phoneNumber = await getSharedContactMsisdn(testFhirBundle)
    expect(phoneNumber).toEqual('+8801622688231')
  })

  it('Throws error when invalid fhir bundle is sent', async () => {
    await expect(
      getSharedContactMsisdn({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).rejects.toThrow('Invalid FHIR bundle found for declaration')
  })

  it('Returns false when phonenumber is missing for shared contact', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    if (
      fhirBundle &&
      fhirBundle.entry &&
      fhirBundle.entry[1] &&
      fhirBundle.entry[1].resource &&
      fhirBundle.entry[1].resource.extension &&
      fhirBundle.entry[1].resource.extension[1] &&
      fhirBundle.entry[1].resource.extension[1].url
    ) {
      fhirBundle.entry[1].resource.extension[1].url = 'INVALID'
      expect(await getSharedContactMsisdn(fhirBundle)).toEqual(false)
    } else {
      throw new Error('Failed')
    }
  })
})

describe('Verify getInformantName', () => {
  it('Returned informant name properly', async () => {
    const informantName = await getInformantName(testFhirBundle)
    expect(informantName).toEqual('অনিক অনিক')
  })

  it('Throws error when invalid fhir bundle is sent', async () => {
    await expect(
      getInformantName({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).rejects.toThrow('Invalid FHIR bundle found for declaration')
  })

  it('Throws error when child name section is missing', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = undefined
    await expect(getInformantName(fhirBundle)).rejects.toThrow(
      "Didn't find informant's name information"
    )
  })

  it("Throws error when child's bn name block is missing", async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = []
    await expect(getInformantName(fhirBundle)).rejects.toThrow(
      "Didn't found informant's bn name"
    )
  })
})

describe('Verify getTrackingId', () => {
  it('Returned tracking id properly', () => {
    const trackingid = getTrackingId(setTrackingId(testFhirBundle))
    if (trackingid) {
      expect(trackingid).toMatch(/^B/)
      expect(trackingid.length).toBe(7)
    } else {
      throw new Error('Failed')
    }
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
  it('Returned birth registration number properly', async () => {
    const practitioner = {
      resourceType: 'Practitioner',
      identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
      telecom: [{ system: 'phone', value: '01711111111' }],
      name: [
        { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
        { use: 'bn', family: '', given: [''] }
      ],
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      },
      id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    }
    fetch.mockResponses(
      [
        JSON.stringify({
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
              resource: {
                resourceType: 'PractitionerRole',
                practitioner: {
                  reference: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                },
                code: [
                  {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/roles',
                        code: 'FIELD_AGENT'
                      }
                    ]
                  }
                ],
                location: [
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdyyyy'
                  }
                ],
                meta: {
                  lastUpdated: '2018-11-25T17:31:08.096+00:00',
                  versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                },
                id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
              }
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UPAZILA'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DISTRICT'
            }
          ]
        }),
        { status: 200 }
      ]
    )
    const birthTrackingId = 'B5WGYJE'
    const brnChecksum = 1
    if (
      testFhirBundle &&
      testFhirBundle.entry &&
      testFhirBundle.entry[1] &&
      testFhirBundle.entry[1].resource &&
      testFhirBundle.entry[1].resource.identifier &&
      testFhirBundle.entry[1].resource.identifier[1] &&
      testFhirBundle.entry[1].resource.identifier[1].value
    ) {
      testFhirBundle.entry[1].resource.identifier[1].value = birthTrackingId
      const taskResource = await pushRN(
        testFhirBundle.entry[1].resource as fhir.Task,
        practitioner,
        'birth-registration-number'
      )
      const brn = getBirthRegistrationNumber(taskResource)

      expect(brn).toBeDefined()
      expect(brn).toMatch(
        new RegExp(
          `^${new Date().getFullYear()}103421${birthTrackingId}${brnChecksum}`
        )
      )
    } else {
      throw new Error('Failed')
    }
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    const testTask = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      focus: {
        reference: 'urn:uuid:888'
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        },
        {
          url:
            'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801622688231'
        }
      ]
    }

    expect(() =>
      getBirthRegistrationNumber(testTask as fhir.Task)
    ).toThrowError("Didn't find any identifier for birth registration number")
  })
})

describe('Verify getRegStatusCode', () => {
  it('Returned right registration status based on token scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: '1573112965',
      algorithm: '',
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
      exp: '1573112965',
      algorithm: '',
      aud: '',
      sub: '1',
      scope: []
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No valid scope found on token'
    )
  })

  it('Throws error when invalid token scope is provided', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: '1573112965',
      algorithm: '',
      aud: '',
      sub: '1',
      scope: ['invalid']
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No valid scope found on token'
    )
  })
})
describe('Verify getPaperFormID', () => {
  it('Returned paper form id properly', () => {
    const testTask = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      focus: {
        reference: 'urn:uuid:888'
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/paper-form-id',
          value: '12345678'
        },
        {
          system: 'http://opencrvs.org/specs/id/birth-tracking-id',
          value: 'B5WGYJE'
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        },
        {
          url:
            'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801622688231'
        }
      ]
    }
    const paperFormID = getPaperFormID(testTask)
    expect(paperFormID).toEqual('12345678')
  })
  it('Throws error when paper form id not found', () => {
    const testTask = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      focus: {
        reference: 'urn:uuid:888'
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        },
        {
          url:
            'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801622688231'
        }
      ]
    }
    expect(() => getPaperFormID(testTask)).toThrowError(
      "Didn't find any identifier for paper form id"
    )
  })
})

describe('Verify getEntryId', () => {
  it('Returned entry id properly', () => {
    const entryId = getEntryId(testFhirTaskBundle)
    expect(entryId).toMatch('ba0412c6-5125-4447-bd32-fb5cf336ddbc')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getEntryId({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('getEntryId: Invalid FHIR bundle found for declaration')
  })
})
