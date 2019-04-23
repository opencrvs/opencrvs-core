import { generateBirthRegPoint } from './pointGenerator'
import * as fetch from 'jest-fetch-mock'

describe('Verify point generation', () => {
  it('Return valid birth registration point to insert in influx', async () => {
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
            status: 'requested',
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
                family: ['মকবুলনিউ']
              }
            ],
            gender: 'male',
            birthDate: '2018-01-01'
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
                family: ['মকবুলনিউমা']
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
                type: 'PERMANENT',
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
                type: 'CURRENT',
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
                url:
                  'http://hl7.org/fhir/StructureDefinition/patient-nationality',
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

    Date.now = jest.fn(() => 1552380296600) // 12-03-2019
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
    const point = await generateBirthRegPoint(payload, 'update-reg', {
      Authorization: 'Bearer mock-token'
    })
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: { reg_status: 'update-reg' },
      fields: {
        current_status: 'registered',
        gender: 'male',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        age_in_days: 435
      }
    })
  })
  it('Throw error when no child section found', () => {
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
            status: 'requested',
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
                family: ['মকবুলনিউমা']
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
                type: 'PERMANENT',
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
                type: 'CURRENT',
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
                url:
                  'http://hl7.org/fhir/StructureDefinition/patient-nationality',
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

    expect(
      generateBirthRegPoint(payload, 'update-reg', {
        Authorization: 'Bearer mock-token'
      })
    ).rejects.toThrowError(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  })
})
