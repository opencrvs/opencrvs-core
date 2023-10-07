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
/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer } from '@metrics/server'
import * as api from '@metrics/api'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetchAny from 'jest-fetch-mock'
import { testDeclaration } from '@metrics/features/registration/testUtils'
import { cloneDeep } from 'lodash'

const fetch = fetchAny as any
const fetchTaskHistory = api.fetchTaskHistory as jest.Mock

const token = jwt.sign(
  { scope: ['declare'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:metrics-user'
  }
)

jest.mock('../metrics/utils', () => {
  const originalModule = jest.requireActual('../metrics//utils')
  return {
    __esModule: true,
    ...originalModule,
    getRegistrationTargetDays: () => 45
  }
})

describe('When a new registration event is received', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.mockResponses(
      [
        JSON.stringify({
          id: '1',
          partOf: {
            reference: 'Location/4'
          }
        })
      ],
      [
        JSON.stringify({
          id: '2',
          partOf: {
            reference: 'Location/3'
          }
        })
      ],
      [
        JSON.stringify({
          id: '3',
          partOf: {
            reference: 'Location/2'
          }
        })
      ]
    )
  })

  it('returns ok for valid new birth declaration', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/new-declaration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: testDeclaration
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 500 for invalid payload in new birth registration', async () => {
    const payload = cloneDeep(testDeclaration)
    // @ts-ignore
    payload.entry[0] = {}
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/new-declaration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })

    expect(res.statusCode).toBe(500)
  })

  it('returns ok for valid new birth registration', async () => {
    const payload = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee',
          resource: {
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: '31dcd26b-a500-483a-b8a1-c2083c1248ee'
            },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  {
                    reference: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a'
                  }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  {
                    reference: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca'
                  }
                ]
              }
            ],
            subject: {},
            date: '2019-03-05T11:38:06.846Z',
            author: [],
            id: 'b2fbb82c-a68d-4793-98e1-87484fc785c4'
          }
        },
        {
          fullUrl: 'urn:uuid:13f293bd-4265-4885-b810-9b8e1e22dc6a',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'BIRTH'
                }
              ]
            },
            focus: {
              reference: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee'
            },
            id: '4b11f298-8bd4-4de0-b02d-f229c3faca9c',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BLVEXNF'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/birth-registration-number',
                value: '2019333494BLVEXNF0'
              }
            ],
            lastModified: '2019-03-05T11:38:15.844Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'REGISTERED'
                }
              ]
            },
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
                }
              },
              {
                url: `http://opencrvs.org/specs/extension/timeLoggedMS`,
                valueInteger: 1234
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: '3b5c1496-2794-4deb-aba0-c3c034695029',
            name: [
              {
                use: 'bn',
                family: ['মকবুল']
              }
            ],
            gender: 'male',
            birthDate: '2018-01-01'
          }
        },
        {
          fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca',
          resource: {
            _id: '625baca6c347200032c3b72b',
            resourceType: 'Encounter',
            status: 'finished',
            location: [
              {
                location: {
                  reference: 'Location/f05c6382-4781-4fa4-98f2-72c4433dc2f7'
                }
              }
            ],
            meta: {
              lastUpdated: '2022-04-17T05:59:02.686+00:00',
              versionId: '3484c5eb-20c0-46df-82dc-2c138ff3c800'
            },
            _transforms: {
              meta: {
                lastUpdated: '2022-04-17T05:59:02.686Z'
              }
            },
            _request: {
              method: 'POST'
            },
            id: '039bcc8e-bb36-4ab1-97fb-95b92b07b7c1'
          }
        },
        {
          fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: '6e33c50b-7e68-405e-a3a4-c8337c04a2f3',
            identifier: [
              {
                value: '12341234123412341',
                type: 'BIRTH_REGISTRATION_NUMBER'
              }
            ],
            name: [
              {
                use: 'bn',
                family: ['রোকেয়া']
              }
            ],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            multipleBirthInteger: 1,
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [
                        {
                          system: 'urn:iso:std:iso:3166',
                          code: 'BGD'
                        }
                      ]
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
              }
            ]
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/new-registration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })

    expect(res.statusCode).toBe(200)
  })
  it('returns ok for valid birth registration', async () => {
    const payload = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:e82b235b-6e9e-49cc-8200-c7969381de4a',
          resource: {
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: 'e82b235b-6e9e-49cc-8200-c7969381de4a'
            },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  {
                    reference: 'urn:uuid:742d8527-499d-414d-b2b4-ea2dfa0f7bdc'
                  }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  {
                    reference: 'urn:uuid:d38c2408-f032-4e69-b1ce-f0ba2a23cca8'
                  }
                ]
              }
            ],
            subject: {},
            date: '2019-03-12T05:42:50.887Z',
            author: [],
            id: '61e34caf-3137-41b3-ac15-975a8a763d4c'
          }
        },
        {
          fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca',
          resource: {
            _id: '625baca6c347200032c3b72b',
            resourceType: 'Encounter',
            status: 'finished',
            location: [
              {
                location: {
                  reference: 'Location/f05c6382-4781-4fa4-98f2-72c4433dc2f7'
                }
              }
            ],
            meta: {
              lastUpdated: '2022-04-17T05:59:02.686+00:00',
              versionId: '3484c5eb-20c0-46df-82dc-2c138ff3c800'
            },
            _transforms: {
              meta: {
                lastUpdated: '2022-04-17T05:59:02.686Z'
              }
            },
            _request: {
              method: 'POST'
            },
            id: '039bcc8e-bb36-4ab1-97fb-95b92b07b7c1'
          }
        },
        {
          fullUrl: 'urn:uuid:c690e34b-6fd2-42e4-90d5-639946fc039f',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'BIRTH'
                }
              ]
            },
            focus: {
              reference: 'urn:uuid:e82b235b-6e9e-49cc-8200-c7969381de4a'
            },
            id: 'c4a0536f-186d-4706-84d1-f156531f1386',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BW6LS3S'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/birth-registration-number',
                value: '2019333494BW6LS3S9'
              }
            ],
            lastModified: '2019-03-12T05:42:54.248Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'REGISTERED'
                }
              ]
            },
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
                }
              },
              {
                url: `http://opencrvs.org/specs/extension/timeLoggedMS`,
                valueInteger: 1234
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:742d8527-499d-414d-b2b4-ea2dfa0f7bdc',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: '27c0cfe4-afab-4468-bbe0-a95ec858eb10',
            name: [
              {
                use: 'bn',
                family: ['মকবুল']
              }
            ],
            gender: 'male',
            birthDate: '2018-01-01'
          }
        },
        {
          fullUrl: 'urn:uuid:d38c2408-f032-4e69-b1ce-f0ba2a23cca8',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: 'b1cdf616-528a-4fd5-988a-53d14182873b',
            identifier: [
              {
                value: '12341234123412341',
                type: 'BIRTH_REGISTRATION_NUMBER'
              }
            ],
            name: [
              {
                use: 'bn',
                family: ['রোকেয়া']
              }
            ],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            multipleBirthInteger: 1,
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [
                        {
                          system: 'urn:iso:std:iso:3166',
                          code: 'BGD'
                        }
                      ]
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
              }
            ]
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-12T05:42:50.887Z'
      }
    }
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/new-registration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })

    expect(res.statusCode).toBe(200)
  })
  it('returns 500 for invalid payload in new birth registration', async () => {
    const payload = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee',
          resource: {
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: '31dcd26b-a500-483a-b8a1-c2083c1248ee'
            },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  {
                    reference: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a'
                  }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  {
                    reference: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca'
                  }
                ]
              }
            ],
            subject: {},
            date: '2019-03-05T11:38:06.846Z',
            author: [],
            id: 'b2fbb82c-a68d-4793-98e1-87484fc785c4'
          }
        },
        {
          fullUrl: 'urn:uuid:13f293bd-4265-4885-b810-9b8e1e22dc6a',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'BIRTH'
                }
              ]
            },
            focus: {
              reference: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee'
            },
            id: '4b11f298-8bd4-4de0-b02d-f229c3faca9c',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BLVEXNF'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/birth-registration-number',
                value: '2019333494BLVEXNF0'
              }
            ],
            lastModified: '2019-03-05T11:38:15.844Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'REGISTERED'
                }
              ]
            },
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
                }
              },
              {
                url: `http://opencrvs.org/specs/extension/timeLoggedMS`,
                valueInteger: 1234
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: '6e33c50b-7e68-405e-a3a4-c8337c04a2f3',
            identifier: [
              {
                value: '12341234123412341',
                type: 'BIRTH_REGISTRATION_NUMBER'
              }
            ],
            name: [
              {
                use: 'bn',
                family: ['রোকেয়া']
              }
            ],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            multipleBirthInteger: 1,
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [
                        {
                          system: 'urn:iso:std:iso:3166',
                          code: 'BGD'
                        }
                      ]
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
              }
            ]
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/new-registration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })

    expect(res.statusCode).toBe(500)
  })
  it('returns 500 for invalid payload in birth registration', async () => {
    const payload = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:e82b235b-6e9e-49cc-8200-c7969381de4a',
          resource: {
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: 'e82b235b-6e9e-49cc-8200-c7969381de4a'
            },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  {
                    reference: 'urn:uuid:742d8527-499d-414d-b2b4-ea2dfa0f7bdc'
                  }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  {
                    reference: 'urn:uuid:d38c2408-f032-4e69-b1ce-f0ba2a23cca8'
                  }
                ]
              }
            ],
            subject: {},
            date: '2019-03-12T05:42:50.887Z',
            author: [],
            id: '61e34caf-3137-41b3-ac15-975a8a763d4c'
          }
        },
        {
          fullUrl: 'urn:uuid:c690e34b-6fd2-42e4-90d5-639946fc039f',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'BIRTH'
                }
              ]
            },
            focus: {
              reference: 'urn:uuid:e82b235b-6e9e-49cc-8200-c7969381de4a'
            },
            id: 'c4a0536f-186d-4706-84d1-f156531f1386',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BW6LS3S'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/birth-registration-number',
                value: '2019333494BW6LS3S9'
              }
            ],
            lastModified: '2019-03-12T05:42:54.248Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'REGISTERED'
                }
              ]
            },
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
                }
              },
              {
                url: `http://opencrvs.org/specs/extension/timeLoggedMS`,
                valueInteger: 1234
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:d38c2408-f032-4e69-b1ce-f0ba2a23cca8',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: 'b1cdf616-528a-4fd5-988a-53d14182873b',
            identifier: [
              {
                value: '12341234123412341',
                type: 'BIRTH_REGISTRATION_NUMBER'
              }
            ],
            name: [
              {
                use: 'bn',
                family: ['রোকেয়া']
              }
            ],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            multipleBirthInteger: 1,
            address: [
              {
                type: 'PRIMARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: [
                  '',
                  '',
                  '',
                  '',
                  '',
                  'ee72f497-343f-4f0f-9062-d618fafc175c'
                ],
                district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
                state: '9a236522-0c3d-40eb-83ad-e8567518c763',
                country: 'BGD'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [
                        {
                          system: 'urn:iso:std:iso:3166',
                          code: 'BGD'
                        }
                      ]
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
              }
            ]
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-12T05:42:50.887Z'
      }
    }
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/new-registration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })

    expect(res.statusCode).toBe(500)
  })
})

describe('When an existing declaration is marked registered', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
  it('writes the delta between DECLARED and VALIDATED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-validated-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/mark-validated',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })
  it('writes the delta between DECLARED and REGISTERED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-registered-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/mark-registered',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })
  it('writes the delta between VALIDATED and WAITING_VALIDATION states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-waiting-validation-request.json')
    const taskHistory = require('./test-data/task-history-validated-response.json')
    fetchTaskHistory.mockReset()
    fetchTaskHistory.mockResolvedValue(taskHistory)
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/waiting-external-resource-validation',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[0][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })

  it('writes the delta between VALIDATED and REGISTERED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-registered-request.json')
    const taskHistory = require('./test-data/task-history-validated-response.json')
    fetchTaskHistory.mockReset()
    fetchTaskHistory.mockResolvedValue(taskHistory)
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/mark-registered',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })

  describe('a death declaration', () => {
    it('writes the delta between REGISTERED and CERTIFIED states to influxdb', async () => {
      const influxClient = require('@metrics/influxdb/client')
      const payload = require('./test-data/mark-death-registered-request.json')
      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/mark-registered',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload
      })
      const declarationEventPoint =
        influxClient.writePoints.mock.calls[1][0].find(
          ({ measurement }: { measurement: string }) =>
            measurement === 'declaration_event_duration'
        )

      expect(res.statusCode).toBe(200)
      expect(declarationEventPoint).toMatchSnapshot()
    })
  })
})
describe('When an existing declaration is marked certified', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('writes the delta between REGISTERED and CERTIFIED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-certified-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/mark-certified',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )

    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })
  describe('a death declaration', () => {
    it('writes the delta between REGISTERED and CERTIFIED states to influxdb', async () => {
      const influxClient = require('@metrics/influxdb/client')
      const payload = require('./test-data/mark-death-certified-request.json')
      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/mark-certified',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload
      })
      expect(res.statusCode).toBe(200)
      const declarationEventPoint =
        influxClient.writePoints.mock.calls[1][0].find(
          ({ measurement }: { measurement: string }) =>
            measurement === 'declaration_event_duration'
        )

      expect(declarationEventPoint).toMatchSnapshot()
    })
  })
  describe('a birth declaration', () => {
    it('writes the declaration_event_duration to influxdb', async () => {
      const influxClient = require('@metrics/influxdb/client')
      const payload = require('./test-data/mark-certified-request.json')
      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/mark-certified',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload
      })
      expect(res.statusCode).toBe(200)
      const declarationEventDurationPoint =
        influxClient.writePoints.mock.calls[1][0].find(
          ({ measurement }: { measurement: string }) => {
            return measurement === 'declaration_event_duration'
          }
        )

      expect(declarationEventDurationPoint).toMatchSnapshot()
    })
  })
})

describe('When an in-progress declaration is received', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('writes the in complete field points to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/new-in-progress-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/in-progress-declaration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const inCompleteFieldPoints =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'in_complete_fields'
      )

    expect(res.statusCode).toBe(200)
    expect(inCompleteFieldPoints).toMatchSnapshot()
  })
  it('returns 500 for payload without expected extension on task resource', async () => {
    const payload = require('./test-data/new-in-progress-request.json')
    payload.entry[1].resource.extension = []
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/in-progress-declaration',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    expect(res.statusCode).toBe(500)
  })

  it('writes the rejected points to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/rejected.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/mark-voided',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const rejectedPoints = influxClient.writePoints.mock.calls[1][0].find(
      ({ measurement }: { measurement: string }) =>
        measurement === 'declarations_rejected'
    )

    expect(res.statusCode).toBe(200)
    expect(rejectedPoints).toMatchSnapshot()
  })
  it('returns 500 for payload without task resource', async () => {
    const payload = require('./test-data/rejected.json')
    payload.entry = []
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/mark-voided',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    expect(res.statusCode).toBe(500)
  })
})
