/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  EVENT_TYPE,
  FHIR_OBSERVATION_CATEGORY_URL,
  FHIR_SPECIFICATION_URL
} from './constants'
import { buildFHIRBundle } from '.'

import * as _ from 'lodash'
import {
  BIRTH_ATTENDANT_CODE,
  BIRTH_TYPE_CODE,
  BODY_WEIGHT_CODE,
  LAST_LIVE_BIRTH_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE
} from './templates'

import {
  Extension,
  OPENCRVS_SPECIFICATION_URL,
  ResourceIdentifier,
  TrackingID,
  URLReference,
  findExtension,
  isTask,
  taskBundleWithExtension,
  updateFHIRTaskBundle
} from '..'

import * as fetchMock from 'jest-fetch-mock'

import { DeathRegistration } from './input'

const fetch = fetchMock as fetchMock.FetchMock

export const mockTask = {
  resourceType: 'Task',
  status: 'ready',
  intent: '',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: '123'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '123'
    },
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-page', value: '123' },
    { system: 'http://opencrvs.org/specs/id/paper-form-book', value: '123' }
  ],
  businessStatus: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/reg-status',
        code: 'DECLARED | VERIFIED | REGISTERED | CERTIFIED'
      }
    ]
  },
  code: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'BIRTH'
      }
    ]
  },
  focus: {
    reference: 'Composition/123' // the composition encompassing this registration
  },
  authoredOn: '2016-10-31T08:25:05+10:00',
  lastModified: '2016-10-31T09:45:05+10:00',
  note: [
    {
      authorString: 'Practitioner/12121212',
      text: 'Comment',
      time: '2016-10-31T09:45:05+10:00'
    }
  ],
  extension: [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: { reference: 'Practitioner/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastLocation',
      valueReference: { reference: 'Location/123' }
    },
    {
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: {
        reference: 'Location/43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      }
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person',
      valueString: 'MOTHER'
    },
    {
      url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
      valueString: '01733333333'
    }
  ],
  meta: {
    versionId: '123'
  }
}

function createListOfAllObjectValues(obj: Record<string, any>): any[] {
  let values: any[] = []

  if (Array.isArray(obj)) {
    for (const item of obj) {
      values = values.concat(createListOfAllObjectValues(item))
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        values = values.concat(createListOfAllObjectValues(obj[key]))
      }
    }
  } else {
    values.push(obj)
  }

  return values
}

test('all values in the death registration are found in the result bundle', () => {
  const record: DeathRegistration = {
    createdAt: '2023-10-05T11:41:23.001Z',
    registration: {
      status: [
        {
          timestamp: '2023-10-05T11:41:23.001Z',
          comments: [
            {
              comment: "Son was declaring father's death",
              createdAt: '2023-10-05T11:41:23.001Z'
            }
          ],
          timeLoggedMS: 1520707
        }
      ],
      informantsSignature:
        'data:image/png;base64,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',
      informantType: 'SON',
      contactPhoneNumber: '+260745645634',
      contactEmail: 'ken@example.com',
      attachments: [
        {
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          subject: 'DECEASED_ID_PROOF',
          type: 'NATIONAL_ID',
          contentType: 'image/png'
        },
        {
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          subject: 'INFORMANT_ID_PROOF',
          type: 'PASSPORT',
          contentType: 'image/png'
        },
        {
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          subject: 'DECEASED_DEATH_CAUSE_PROOF',
          type: 'VERBAL_AUTOPSY_REPORT',
          contentType: 'image/png'
        }
      ],
      draftId: '9a0e52f2-6066-4312-b950-258d31570e96'
    },
    deceased: {
      name: [
        {
          use: 'en',
          firstNames: 'Kennedy',
          familyName: 'Wheeler'
        }
      ],
      gender: 'male',
      birthDate: '2000-05-04',
      nationality: ['FAR'],
      identifier: [
        {
          id: '1231231231',
          type: 'NATIONAL_ID'
        }
      ],
      maritalStatus: 'SINGLE',
      address: [
        {
          type: 'PRIMARY_ADDRESS',
          line: [
            '',
            '',
            '',
            '',
            'Ibombo village',
            'RURAL',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          country: 'FAR',
          state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
          district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
        }
      ],
      deceased: {
        deceased: true,
        deathDate: '2001-06-03'
      }
    },
    mannerOfDeath: 'NATURAL_CAUSES',
    causeOfDeathEstablished: 'true',
    causeOfDeathMethod: 'VERBAL_AUTOPSY',
    deathDescription: 'Fell down the stairs',
    eventLocation: {
      _fhirID: 'd732336f-0c08-445c-a7cd-3557e1d1931c'
    },
    informant: {
      name: [
        {
          use: 'en',
          firstNames: 'Matt',
          familyName: 'Wheeler'
        }
      ],
      birthDate: '1992-06-04',
      nationality: ['FAR'],
      identifier: [
        {
          id: '1231231876',
          type: 'NATIONAL_ID'
        }
      ],
      address: [
        {
          type: 'PRIMARY_ADDRESS',
          line: [
            '',
            '',
            '',
            '',
            'Ibombo village',
            'RURAL',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          country: 'FAR',
          state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
          district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
        }
      ]
    }
  }

  const input = createListOfAllObjectValues(record)
  const output = createListOfAllObjectValues(
    buildFHIRBundle(record, EVENT_TYPE.DEATH)
  )

  for (const key of input) {
    if (
      !output.some((x) => (typeof x === 'string' ? x.endsWith(key) : x === key))
    ) {
      throw new Error(`Missing key: ${key}`)
    }
  }
})

test('should build a minimal FHIR registration document without error', async () => {
  fetch.mockResponse(
    JSON.stringify({
      refUrl: 'data:image/png;base64,2324256'
    })
  )
  const fhir: any = buildFHIRBundle(
    {
      mother: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb39',
        identifier: [{ id: '123456', type: 'OTHER', otherType: 'Custom type' }],
        gender: 'female',
        birthDate: '2000-01-28',
        maritalStatus: 'MARRIED',
        name: [{ firstNames: 'Jane', familyName: 'Doe', use: 'en' }],
        multipleBirth: 1,
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_3',
        occupation: 'Mother Occupation',
        reasonNotApplying: ''
      },
      father: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb40',
        gender: 'male',
        name: [],
        telecom: [{ use: 'mobile', system: 'phone', value: '0171111111' }],
        maritalStatus: 'MARRIED',
        birthDate: '2000-09-28',
        multipleBirth: 2,
        address: [
          {
            use: 'home',
            type: 'both',
            line: ['2760 Mlosi Street', 'Wallacedene'],
            district: 'Kraaifontein',
            state: 'Western Cape',
            city: 'Cape Town',
            postalCode: '7570',
            country: 'BGD'
          },
          {
            use: 'home',
            type: 'both',
            line: ['40 Orbis Wharf', 'Wallacedene'],
            text: 'Optional address text',
            district: 'Kraaifontein',
            state: 'Western Cape',
            city: 'Cape Town',
            postalCode: '7570',
            country: 'BGD'
          }
        ],
        photo: [
          {
            contentType: 'image/jpeg',
            data: '123456'
          }
        ],
        dateOfMarriage: '2014-01-28',
        nationality: ['BGD'],
        educationalAttainment: 'UPPER_SECONDARY_ISCED_3',
        occupation: 'Father Occupation',
        reasonNotApplying: ''
      },
      child: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eeb41',
        gender: 'male',
        name: [],
        birthDate: '2018-01-28',
        maritalStatus: 'NOT_STATED',
        multipleBirth: 3,
        dateOfMarriage: '',
        nationality: ['BGD'],
        educationalAttainment: 'NO_SCHOOLING'
      },
      registration: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        informantType: 'MOTHER',
        contactPhoneNumber: '01733333333',
        paperFormID: '12345678',
        draftId: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        trackingId: 'B123456',
        registrationNumber: '201923324512345671',
        inCompleteFields:
          'child/child-view-group/placeOfBirth,' +
          'mother/mother-view-group/iDType,' +
          'mother/mother-view-group/iD,' +
          'mother/mother-view-group/familyName,' +
          'mother/mother-view-group/familyNameEng',
        status: [
          {
            comments: [
              {
                comment: 'This is just a test data',
                createdAt: '2018-10-31T09:40:05+10:00'
              }
            ],
            timestamp: '2018-10-31T09:40:05+10:00',
            timeLoggedMS: 1234
          }
        ],
        attachments: [
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce11',
            contentType: 'image/jpeg',
            data: 'SampleData',
            status: 'validated',
            originalFileName: 'original.jpg',
            systemFileName: 'system.jpg',
            type: 'NATIONAL_ID',
            createdAt: '2018-10-21'
          },
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce22',
            contentType: 'image/png',
            data: 'ExampleData',
            status: 'validated' as const,
            originalFileName: 'original.png',
            systemFileName: 'system.png',
            type: 'PASSPORT',
            createdAt: '2018-10-22',
            subject: 'MOTHER'
          }
        ],
        certificates: [
          {
            collector: {
              relationship: 'OTHER',
              affidavit: [
                {
                  contentType: 'image/jpg',
                  data: 'data:image/png;base64,2324256'
                }
              ],
              name: [{ firstNames: 'Doe', familyName: 'Jane', use: 'en' }],
              identifier: [{ id: '123456', type: 'PASSPORT' }]
            },
            hasShowedVerifiedDocument: true,
            payments: [
              {
                paymentId: '1234',
                type: 'MANUAL',
                total: 50,
                amount: 50,
                outcome: 'COMPLETED',
                date: '2018-10-22'
              }
            ],
            data: 'data:image/png;base64,2324256'
          }
        ]
      },
      eventLocation: {
        type: 'PRIVATE_HOME',
        partOf: 'Location/456',
        address: {
          country: '789',
          state: '101112',
          district: '131415',
          postalCode: 'sw11',
          line: [
            'addressLine1',
            'addressLine1UrbanOption',
            'addressLine2',
            '123',
            '456',
            '789'
          ]
        }
      },
      birthType: 'SINGLE',
      weightAtBirth: 3,
      attendantAtBirth: 'NURSE',
      childrenBornAliveToMother: 2,
      foetalDeathsToMother: 0,
      lastPreviousLiveBirth: '2014-01-28',
      createdAt: '2018-10-31T09:45:05+10:00',
      _fhirIDMap: {
        composition: '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd',
        encounter: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsakelske',
        observation: {
          birthType: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3283',
          weightAtBirth: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3293',
          attendantAtBirth: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3203',
          childrenBornAliveToMother:
            '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3283kdsoe',
          foetalDeathsToMother: '8f18a6ea-89d1-4b03-80b3-57509a7eebce-kdsa2324',
          lastPreviousLiveBirth:
            '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsa23324lsdafk'
        }
      }
    },
    EVENT_TYPE.BIRTH
  )
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.section.length).toBe(7)
  expect(fhir.entry[0].resource.date).toBeDefined()
  expect(fhir.entry[0].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebcedsd'
  )

  expect(fhir.entry[1].resource.gender).toBe('female')
  expect(fhir.entry[1].resource.id).toBe('8f18a6ea-89d1-4b03-80b3-57509a7eeb39')
  expect(fhir.entry[1].resource.name[0].given[0]).toBe('Jane')
  expect(fhir.entry[1].resource.name[0].family[0]).toBe('Doe')
  expect(fhir.entry[1].resource.name[0].use).toBe('en')
  expect(fhir.entry[1].resource.identifier[0].value).toBe('123456')
  expect(fhir.entry[1].resource.identifier[0].type.coding[0].code).toBe('OTHER')
  expect(fhir.entry[1].resource.identifier[0].otherType).toBe('Custom type')
  expect(fhir.entry[1].resource.birthDate).toBe('2000-01-28')
  expect(fhir.entry[1].resource.maritalStatus.text).toBe('MARRIED')
  expect(fhir.entry[1].resource.maritalStatus.coding[0].code).toBe('M')
  expect(fhir.entry[1].resource.multipleBirthInteger).toBe(1)
  expect(fhir.entry[1].resource.extension[0].valueDateTime).toBe('2014-01-28')
  expect(fhir.entry[1].resource.extension[1]).toEqual({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
  expect(fhir.entry[1].resource.extension[2].valueString).toBe(
    'UPPER_SECONDARY_ISCED_3'
  )
  expect(fhir.entry[1].resource.extension[2].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`
  )
  expect(fhir.entry[1].resource.extension[3].valueString).toBe(
    'Mother Occupation'
  )
  expect(fhir.entry[1].resource.extension[3].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`
  )
  expect(fhir.entry[1].resource.extension[0].valueDateTime).toBe('2014-01-28')

  expect(fhir.entry[2].resource.id).toBe('8f18a6ea-89d1-4b03-80b3-57509a7eeb40')
  expect(fhir.entry[2].resource.gender).toBe('male')
  expect(fhir.entry[2].resource.telecom[0].value).toBe('0171111111')
  expect(fhir.entry[2].resource.telecom[0].system).toBe('phone')
  expect(fhir.entry[2].resource.telecom[0].use).toBe('mobile')
  expect(fhir.entry[2].resource.birthDate).toBe('2000-09-28')
  expect(fhir.entry[2].resource.maritalStatus.text).toBe('MARRIED')
  expect(fhir.entry[2].resource.maritalStatus.coding[0].code).toBe('M')
  expect(fhir.entry[2].resource.multipleBirthInteger).toBe(2)
  expect(fhir.entry[2].resource.address[0].use).toBe('home')
  expect(fhir.entry[2].resource.address[0].line[0]).toBe('2760 Mlosi Street')
  expect(fhir.entry[2].resource.address[1].line[0]).toBe('40 Orbis Wharf')
  expect(fhir.entry[2].resource.address[1].text).toBe('Optional address text')
  expect(fhir.entry[2].resource.extension[1]).toEqual({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
  expect(fhir.entry[2].resource.extension[2].valueString).toBe(
    'UPPER_SECONDARY_ISCED_3'
  )
  expect(fhir.entry[2].resource.extension[2].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`
  )
  expect(fhir.entry[3].resource.id).toBe('8f18a6ea-89d1-4b03-80b3-57509a7eeb41')
  expect(fhir.entry[3].resource.gender).toBe('male')
  expect(fhir.entry[3].resource.birthDate).toBe('2018-01-28')
  expect(fhir.entry[3].resource.maritalStatus.text).toBe('NOT_STATED')
  expect(fhir.entry[3].resource.maritalStatus.coding[0].code).toBe('UNK')
  expect(fhir.entry[3].resource.multipleBirthInteger).toBe(3)

  expect(fhir.entry[3].resource.extension[0].valueDateTime).toBe('')
  expect(fhir.entry[3].resource.extension[1]).toEqual({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: [{ system: 'urn:iso:std:iso:3166', code: 'BGD' }]
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
  expect(fhir.entry[3].resource.extension[2].valueString).toBe('NO_SCHOOLING')
  expect(fhir.entry[3].resource.extension[2].url).toBe(
    `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`
  )

  /* RelatedPerson Test cases */

  /* Task Test cases */
  expect(fhir.entry[4].resource.resourceType).toBe('Task')
  expect(fhir.entry[4].resource.id).toBe('8f18a6ea-89d1-4b03-80b3-57509a7eebce')
  expect(fhir.entry[4].resource.code).toEqual({
    coding: [
      {
        system: `${OPENCRVS_SPECIFICATION_URL}types`,
        code: 'BIRTH'
      }
    ]
  })
  expect(fhir.entry[4].resource.extension[0]).toEqual({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
    valueString: 'MOTHER'
  })
  expect(fhir.entry[4].resource.extension[1]).toEqual({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
    valueString: '01733333333'
  })
  expect(fhir.entry[4].resource.extension[3]).toEqual({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/timeLoggedMS`,
    valueInteger: 1234
  })
  expect(fhir.entry[4].resource.status).toEqual('draft')
  expect(fhir.entry[4].resource.lastModified).toEqual(
    '2018-10-31T09:45:05+10:00'
  )
  expect(fhir.entry[4].resource.note[0]).toEqual({
    text: 'This is just a test data',
    time: '2018-10-31T09:40:05+10:00'
  })
  expect(fhir.entry[4].resource.identifier).toEqual([
    { system: 'http://opencrvs.org/specs/id/paper-form-id', value: '12345678' },
    {
      system: 'http://opencrvs.org/specs/id/draft-id',
      value: '8f18a6ea-89d1-4b03-80b3-57509a7eebce'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
      value: 'B123456'
    },
    {
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '201923324512345671'
    }
  ])
  // Attachment Test cases
  expect(fhir.entry[6].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce11'
  )
  expect(fhir.entry[6].resource.docStatus).toBe('validated')
  expect(fhir.entry[6].resource.created).toBe('2018-10-21')
  expect(fhir.entry[6].resource.type).toEqual({
    coding: [
      {
        system: 'http://opencrvs.org/specs/supporting-doc-type',
        code: 'NATIONAL_ID'
      }
    ]
  })
  expect(fhir.entry[6].resource.content).toEqual([
    {
      attachment: {
        contentType: 'image/jpeg',
        data: 'SampleData'
      }
    }
  ])
  expect(fhir.entry[6].resource.identifier).toEqual([
    {
      system: 'http://opencrvs.org/specs/id/original-file-name',
      value: 'original.jpg'
    },
    {
      system: 'http://opencrvs.org/specs/id/system-file-name',
      value: 'system.jpg'
    }
  ])
  expect(fhir.entry[7].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce22'
  )
  expect(fhir.entry[7].resource.docStatus).toBe('approved')
  expect(fhir.entry[7].resource.created).toBe('2018-10-22')
  expect(fhir.entry[7].resource.type).toEqual({
    coding: [
      {
        system: 'http://opencrvs.org/specs/supporting-doc-type',
        code: 'PASSPORT'
      }
    ]
  })
  expect(fhir.entry[7].resource.identifier).toEqual([
    {
      system: 'http://opencrvs.org/specs/id/original-file-name',
      value: 'original.png'
    },
    {
      system: 'http://opencrvs.org/specs/id/system-file-name',
      value: 'system.png'
    }
  ])
  expect(fhir.entry[7].resource.content).toEqual([
    {
      attachment: {
        contentType: 'image/png',
        data: 'ExampleData'
      }
    }
  ])
  expect(fhir.entry[7].resource.subject).toEqual({
    display: 'MOTHER'
  })
  // Certificate collection
  expect(fhir.entry[8].resource.resourceType).toBe('DocumentReference')

  expect(fhir.entry[8].resource.type).toEqual({
    coding: [
      {
        system: 'http://opencrvs.org/specs/certificate-type',
        code: 'BIRTH'
      }
    ]
  })
  expect(fhir.entry[8].resource.extension).toEqual([
    {
      url: 'http://opencrvs.org/specs/extension/collector',
      valueReference: {
        reference: fhir.entry[9].fullUrl
      }
    },
    {
      url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
      valueBoolean: true
    },
    {
      url: 'http://opencrvs.org/specs/extension/payment',
      valueReference: {
        reference: fhir.entry[11].fullUrl
      }
    }
  ])
  expect(fhir.entry[8].resource.content).toEqual([
    {
      attachment: {
        contentType: 'application/pdf',
        data: 'data:image/png;base64,2324256'
      }
    }
  ])

  //  Affidavit checking
  expect(fhir.entry[9].resource.extension).toEqual([
    {
      url: 'http://opencrvs.org/specs/extension/relatedperson-affidavittype',
      valueAttachment: {
        contentType: 'image/jpg',
        data: 'data:image/png;base64,2324256'
      }
    }
  ])

  expect(fhir.entry[9].resource.resourceType).toBe('RelatedPerson')
  expect(fhir.entry[9].resource.relationship).toEqual({
    coding: [
      {
        system: 'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
        code: 'OTHER'
      }
    ]
  })
  expect(fhir.entry[9].resource.patient.reference).toBe(fhir.entry[10].fullUrl)

  expect(fhir.entry[10].resource.resourceType).toBe('Patient')
  expect(fhir.entry[10].resource.name).toEqual([
    {
      use: 'en',
      family: ['Jane'],
      given: ['Doe']
    }
  ])
  expect(fhir.entry[10].resource.identifier).toEqual([
    {
      id: '123456',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/identifier-type',
            code: 'PASSPORT'
          }
        ]
      }
    }
  ])

  expect(fhir.entry[11].resource.resourceType).toBe('PaymentReconciliation')
  expect(fhir.entry[11].resource.status).toBe('active')
  expect(fhir.entry[11].resource.identifier).toEqual([
    {
      system: 'http://opencrvs.org/specs/id/payment-id',
      value: '1234'
    }
  ])
  expect(fhir.entry[11].resource.total).toBe(50)
  expect(fhir.entry[11].resource.outcome).toEqual({
    coding: [{ code: 'COMPLETED' }]
  })
  expect(fhir.entry[11].resource.detail).toEqual([
    {
      type: { coding: [{ code: 'MANUAL' }] },
      amount: 50,
      date: '2018-10-22'
    }
  ])

  // Encounter
  expect(fhir.entry[12].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsakelske'
  )
  expect(fhir.entry[12].resource.resourceType).toBe('Encounter')

  expect(fhir.entry[13].resource.resourceType).toBe('Location')
  expect(fhir.entry[13].resource.partOf.reference).toBe('Location/456')
  expect(fhir.entry[13].resource.address.country).toBe('789')
  expect(fhir.entry[13].resource.address.state).toBe('101112')
  expect(fhir.entry[13].resource.address.district).toBe('131415')
  expect(fhir.entry[13].resource.address.postalCode).toBe('sw11')

  // Observation
  expect(fhir.entry[14].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3283'
  )
  expect(fhir.entry[14].resource.valueQuantity.value).toBe('SINGLE')
  expect(fhir.entry[14].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[14].resource.category).toEqual([
    {
      coding: [
        {
          system: FHIR_OBSERVATION_CATEGORY_URL,
          code: 'procedure',
          display: 'Procedure'
        }
      ]
    }
  ])
  expect(fhir.entry[14].resource.code.coding).toEqual([
    {
      system: 'http://loinc.org',
      code: BIRTH_TYPE_CODE,
      display: 'Birth plurality of Pregnancy'
    }
  ])
  expect(fhir.entry[15].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3293'
  )
  expect(fhir.entry[15].resource.valueQuantity.value).toBe(3)
  expect(fhir.entry[15].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[15].resource.category).toEqual([
    {
      coding: [
        {
          system: FHIR_OBSERVATION_CATEGORY_URL,
          code: 'vital-signs',
          display: 'Vital Signs'
        }
      ]
    }
  ])
  expect(fhir.entry[15].resource.code.coding).toEqual([
    {
      system: 'http://loinc.org',
      code: BODY_WEIGHT_CODE,
      display: 'Body weight Measured'
    }
  ])
  expect(fhir.entry[16].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3203'
  )
  expect(fhir.entry[16].resource.valueString).toBe('NURSE')
  expect(fhir.entry[16].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[16].resource.category).toEqual([
    {
      coding: [
        {
          system: FHIR_OBSERVATION_CATEGORY_URL,
          code: 'procedure',
          display: 'Procedure'
        }
      ]
    }
  ])
  expect(fhir.entry[16].resource.code.coding).toEqual([
    {
      system: 'http://loinc.org',
      code: BIRTH_ATTENDANT_CODE,
      display: 'Birth attendant title'
    }
  ])

  expect(fhir.entry[17].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3283kdsoe'
  )
  expect(fhir.entry[17].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[17].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dh3283kdsoe'
  )
  expect(fhir.entry[17].resource.valueQuantity.value).toBe(2)
  expect(fhir.entry[17].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[17].resource.code.coding).toEqual([
    {
      system: 'http://loinc.org',
      code: NUMBER_BORN_ALIVE_CODE,
      display: 'Number born alive to mother'
    }
  ])
  expect(fhir.entry[18].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-kdsa2324'
  )
  expect(fhir.entry[18].resource.valueQuantity.value).toBe(0)
  expect(fhir.entry[19].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[18].resource.code.coding).toEqual([
    {
      system: 'http://loinc.org',
      code: NUMBER_FOEATAL_DEATH_CODE,
      display: 'Number foetal deaths to mother'
    }
  ])
  expect(fhir.entry[19].resource.id).toBe(
    '8f18a6ea-89d1-4b03-80b3-57509a7eebce-dsa23324lsdafk'
  )
  expect(fhir.entry[19].resource.valueDateTime).toBe('2014-01-28')
  expect(fhir.entry[19].resource.context.reference).toEqual(
    fhir.entry[12].fullUrl
  )
  expect(fhir.entry[19].resource.code.coding).toEqual([
    {
      system: 'http://loinc.org',
      code: LAST_LIVE_BIRTH_CODE,
      display: 'Date last live birth'
    }
  ])
})

test('should update a task document as rejected', async () => {
  fetch.mockResponse(
    JSON.stringify({
      refUrl: 'data:image/png;base64,2324256'
    })
  )
  const fhir: any = updateFHIRTaskBundle(
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc' as URLReference,
      resource: {
        resourceType: 'Task',
        intent: 'order',
        status: 'ready',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: { reference: 'DUMMY' as ResourceIdentifier }
          }
        ],
        lastModified: '2018-11-28T15:13:57.492Z',
        note: [
          { text: '', time: '2018-11-28T15:13:57.492Z', authorString: 'DUMMY' }
        ],
        focus: {
          reference:
            'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422' as ResourceIdentifier
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B1mW7jA' as TrackingID
          }
        ],
        businessStatus: {
          coding: [
            { system: 'http://opencrvs.org/specs/reg-status', code: 'DECLARED' }
          ]
        },
        meta: {
          lastUpdated: '2018-11-29T14:50:34.127+00:00',
          versionId: '6bd9d08f-58e2-48f7-8279-ca08e64a3942'
        },
        id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
      }
    },
    'REJECTED',
    'Misspelling',
    'Child name was misspelled'
  )

  const rejectedReason = 'Misspelling'
  const rejectedText = 'Child name was misspelled'
  expect(fhir).toBeDefined()
  expect(fhir.entry[0].resource.reason.text).toEqual(rejectedReason)
  expect(fhir.entry[0].resource.statusReason.text).toEqual(rejectedText)
  expect(fhir.entry[0].resource.businessStatus.coding[0].code).toEqual(
    'REJECTED'
  )
})

test.only('creates task with contact other relationship', async () => {
  fetch.mockResponse(
    JSON.stringify({
      refUrl: 'data:image/png;base64,2324256'
    })
  )
  const simpleFhir = buildFHIRBundle(
    {
      registration: {
        _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce',
        informantType: 'OTHER',
        otherInformantType: 'Friend',
        contactPhoneNumber: '01733333333',
        paperFormID: '12345678',
        trackingId: 'B123456',
        registrationNumber: '201923324512345671',
        inCompleteFields:
          'child/child-view-group/placeOfBirth,' +
          'mother/mother-view-group/iDType,' +
          'mother/mother-view-group/iD,' +
          'mother/mother-view-group/familyName,' +
          'mother/mother-view-group/familyNameEng',
        status: [
          {
            comments: [
              {
                comment: 'This is just a test data',
                createdAt: '2018-10-31T09:40:05+10:00'
              }
            ],
            timestamp: '2018-10-31T09:40:05+10:00',
            timeLoggedMS: 1234
          }
        ],
        attachments: [
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce11',
            contentType: 'image/jpeg',
            data: 'SampleData',
            status: 'final',
            originalFileName: 'original.jpg',
            systemFileName: 'system.jpg',
            type: 'NATIONAL_ID',
            createdAt: '2018-10-21'
          },
          {
            _fhirID: '8f18a6ea-89d1-4b03-80b3-57509a7eebce22',
            contentType: 'image/png',
            data: 'ExampleData',
            status: 'deleted',
            originalFileName: 'original.png',
            systemFileName: 'system.png',
            type: 'PASSPORT',
            createdAt: '2018-10-22',
            subject: 'MOTHER'
          }
        ],
        certificates: [
          {
            collector: {
              relationship: 'OTHER',
              affidavit: {
                contentType: 'image/jpg',
                data: 'ExampleData'
              },
              name: [{ firstNames: 'Doe', familyName: 'Jane', use: 'en' }],
              identifier: [{ id: '123456', type: 'PASSPORT' }]
            },
            hasShowedVerifiedDocument: true,
            payments: [
              {
                paymentId: '1234',
                type: 'MANUAL',
                total: 50,
                amount: 50,
                outcome: 'COMPLETED',
                date: '2018-10-22'
              }
            ],
            data: 'DUMMY-DATA'
          }
        ]
      }
    } as any,
    'BIRTH' as EVENT_TYPE
  )

  expect(simpleFhir).toBeDefined()

  const taskResource = simpleFhir!.entry
    .map(({ resource }) => resource)
    .find(isTask)

  expect(taskResource).toBeDefined()
  expect(
    taskResource?.extension?.some((taskExtension) =>
      _.isEqual(taskExtension, {
        url: 'http://opencrvs.org/specs/extension/contact-person',
        valueString: 'OTHER'
      })
    )
  ).toBe(true)

  expect(
    taskResource?.extension?.some((taskExtension) =>
      _.isEqual(taskExtension, {
        url: 'http://opencrvs.org/specs/extension/contact-relationship',
        valueString: 'Friend'
      })
    )
  ).toBe(true)
})

describe('taskBundleWithExtension()', () => {
  it('should add the extension', () => {
    const bundle = taskBundleWithExtension({ resource: mockTask as any }, {
      url: 'mock-url',
      valueString: 'mock-value'
    } as any)
    const extension = bundle.entry[0].resource.extension as Extension[]
    expect(findExtension('mock-url' as any, extension)).toHaveProperty(
      'valueString',
      'mock-value'
    )
  })
})
