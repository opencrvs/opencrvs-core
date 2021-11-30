/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  getSectionBySectionCode,
  getRegLastLocation,
  getRegLastOffice,
  getResourceByType,
  getObservationValueByCode,
  getTimeLoggedFromTask,
  isNotification,
  getStartedByFieldAgent,
  FHIR_RESOURCE_TYPE,
  CAUSE_OF_DEATH_CODE
} from '@metrics/features/registration/fhirUtils'

describe('fhirUtils', () => {
  it('throw error when no person section is found', () => {
    const bundle = {
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
                  code: 'birth-application'
                }
              ],
              text: 'Birth Application'
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
    const sectionCode = 'child-details'
    expect(() => getSectionBySectionCode(bundle, sectionCode)).toThrow()
  })
  it('thorws error when no task is provided in the bundle', () => {
    const bundle = {
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
                  code: 'birth-application'
                }
              ],
              text: 'Birth Application'
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

    expect(() => getRegLastLocation(bundle)).toThrow()
    expect(() => getRegLastOffice(bundle)).toThrow()
  })
  it('returns false if no resource is provided in the bundle to get composition', () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee'
        },
        {
          fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca'
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }

    expect(
      getResourceByType(bundle, FHIR_RESOURCE_TYPE.COMPOSITION)
    ).toBeFalsy()
  })
  it('returns false if no resource is provided in the bundle to get task', () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:31dcd26b-a500-483a-b8a1-c2083c1248ee'
        },
        {
          fullUrl: 'urn:uuid:97de26f7-a9ea-4c46-a974-9be38cac41ca'
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }

    expect(getResourceByType(bundle, FHIR_RESOURCE_TYPE.TASK)).toBeFalsy()
  })
  it('returns cause of death from the observations in a composition', () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82',
          resource: {
            identifier: { system: 'urn:ietf:rfc:3986', value: 'DWMWZ9X' },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'death-application'
                }
              ],
              text: 'Death Application'
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
            title: 'Death Application',
            section: [
              {
                title: 'Deceased details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'deceased-details'
                    }
                  ],
                  text: 'Deceased details'
                },
                entry: [
                  { reference: 'urn:uuid:42c8acf3-dcd9-45b1-9390-12f6b289be38' }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  { reference: 'urn:uuid:f2945611-5af6-4946-bd67-16f571cbc979' }
                ]
              },
              {
                title: 'Death encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'death-encounter'
                    }
                  ],
                  text: 'Death encounter'
                },
                entry: [
                  { reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d' }
                ]
              }
            ],
            subject: {},
            date: '2019-11-30T13:01:33.651Z',
            author: [],
            id: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433'
          }
        },
        {
          fullUrl: 'urn:uuid:33ae7ca1-0fb8-4685-bcd3-80ced7dde3cc',
          resource: {
            resourceType: 'Observation',
            status: 'final',
            context: {
              reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d'
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'uncertified-manner-of-death',
                  display: 'Uncertified manner of death'
                }
              ]
            },
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/ValueSet/icd-10',
                  code: 'NATURAL_CAUSES'
                }
              ]
            }
          }
        },
        {
          fullUrl: 'urn:uuid:02e69cae-e68e-4264-99d2-2e0bd44d090e',
          resource: {
            resourceType: 'Observation',
            status: 'final',
            context: {
              reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d'
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'ICD10',
                  display: 'Cause of death'
                }
              ]
            },
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/ValueSet/icd-10',
                  code: 'Old age'
                }
              ]
            }
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }

    expect(getObservationValueByCode(bundle, CAUSE_OF_DEATH_CODE)).toEqual(
      'Old age'
    )
  })
  it('returns UNKNOWN if no observations exist in a composition', () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82',
          resource: {
            identifier: { system: 'urn:ietf:rfc:3986', value: 'DWMWZ9X' },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'death-application'
                }
              ],
              text: 'Death Application'
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
            title: 'Death Application',
            section: [
              {
                title: 'Deceased details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'deceased-details'
                    }
                  ],
                  text: 'Deceased details'
                },
                entry: [
                  { reference: 'urn:uuid:42c8acf3-dcd9-45b1-9390-12f6b289be38' }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  { reference: 'urn:uuid:f2945611-5af6-4946-bd67-16f571cbc979' }
                ]
              },
              {
                title: 'Death encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'death-encounter'
                    }
                  ],
                  text: 'Death encounter'
                },
                entry: [
                  { reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d' }
                ]
              }
            ],
            subject: {},
            date: '2019-11-30T13:01:33.651Z',
            author: [],
            id: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433'
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }

    expect(getObservationValueByCode(bundle, CAUSE_OF_DEATH_CODE)).toEqual(
      'UNKNOWN'
    )
  })
  it('returns UNKNOWN if no observation can be found for a given code in a composition', () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82',
          resource: {
            identifier: { system: 'urn:ietf:rfc:3986', value: 'DWMWZ9X' },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'death-application'
                }
              ],
              text: 'Death Application'
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
            title: 'Death Application',
            section: [
              {
                title: 'Deceased details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'deceased-details'
                    }
                  ],
                  text: 'Deceased details'
                },
                entry: [
                  { reference: 'urn:uuid:42c8acf3-dcd9-45b1-9390-12f6b289be38' }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  { reference: 'urn:uuid:f2945611-5af6-4946-bd67-16f571cbc979' }
                ]
              },
              {
                title: 'Death encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'death-encounter'
                    }
                  ],
                  text: 'Death encounter'
                },
                entry: [
                  { reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d' }
                ]
              }
            ],
            subject: {},
            date: '2019-11-30T13:01:33.651Z',
            author: [],
            id: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433'
          }
        },
        {
          fullUrl: 'urn:uuid:33ae7ca1-0fb8-4685-bcd3-80ced7dde3cc',
          resource: {
            resourceType: 'Observation',
            status: 'final',
            context: {
              reference: 'urn:uuid:644fc036-88a1-4213-bf4e-3a7b970bf10d'
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'uncertified-manner-of-death',
                  display: 'Uncertified manner of death'
                }
              ]
            },
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/ValueSet/icd-10',
                  code: 'NATURAL_CAUSES'
                }
              ]
            }
          }
        }
      ],
      meta: {
        lastUpdated: '2019-03-05T11:38:06.846Z'
      }
    }

    expect(getObservationValueByCode(bundle, CAUSE_OF_DEATH_CODE)).toEqual(
      'UNKNOWN'
    )
  })
  it('returns time taken to complete task', () => {
    const task = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      code: {
        coding: [{ system: 'http://opencrvs.org/specs/types', code: 'DEATH' }]
      },
      focus: {
        reference: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82'
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/draft-id',
          value: '914d7ad6-addb-430d-a08d-b225635e9860'
        },
        {
          system: 'http://opencrvs.org/specs/id/death-tracking-id',
          value: 'DWMWZ9X'
        },
        {
          system: 'http://opencrvs.org/specs/id/death-registration-number',
          value: '20196816020000113'
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'APPLICANT'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-relationship',
          valueString: ''
        },
        {
          url:
            'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801916543214'
        },
        {
          url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
          valueInteger: 63445
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastUser',
          valueReference: {
            reference: 'Practitioner/ec1f4476-182f-408f-9da2-aff0c9bd1f26'
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastLocation',
          valueReference: {
            reference: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastOffice',
          valueReference: {
            reference: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3'
          }
        }
      ],
      lastModified: '2019-11-30T13:01:34.559Z',
      businessStatus: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/reg-status',
            code: 'REGISTERED'
          }
        ]
      }
    }

    expect(getTimeLoggedFromTask(task)).toEqual(63445)
  })
  it('Throws error if task has no extension', () => {
    const task = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      code: {
        coding: [{ system: 'http://opencrvs.org/specs/types', code: 'DEATH' }]
      },
      focus: {
        reference: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82'
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/draft-id',
          value: '914d7ad6-addb-430d-a08d-b225635e9860'
        },
        {
          system: 'http://opencrvs.org/specs/id/death-tracking-id',
          value: 'DWMWZ9X'
        },
        {
          system: 'http://opencrvs.org/specs/id/death-registration-number',
          value: '20196816020000113'
        }
      ]
    }
    expect(() => getTimeLoggedFromTask(task)).toThrowError(
      'Task has no extensions defined, task ID: undefined'
    )
  })
  it('Throws error if task has no time logged', () => {
    const task = {
      resourceType: 'Task',
      status: 'requested',
      intent: '',
      code: {
        coding: [{ system: 'http://opencrvs.org/specs/types', code: 'DEATH' }]
      },
      focus: {
        reference: 'urn:uuid:4dfc9a53-0ecd-4f6e-9a53-915f60d73f82'
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/draft-id',
          value: '914d7ad6-addb-430d-a08d-b225635e9860'
        },
        {
          system: 'http://opencrvs.org/specs/id/death-tracking-id',
          value: 'DWMWZ9X'
        },
        {
          system: 'http://opencrvs.org/specs/id/death-registration-number',
          value: '20196816020000113'
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'APPLICANT'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-relationship',
          valueString: ''
        },
        {
          url:
            'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '+8801916543214'
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastUser',
          valueReference: {
            reference: 'Practitioner/ec1f4476-182f-408f-9da2-aff0c9bd1f26'
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastLocation',
          valueReference: {
            reference: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastOffice',
          valueReference: {
            reference: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3'
          }
        }
      ],
      lastModified: '2019-11-30T13:01:34.559Z',
      businessStatus: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/reg-status',
            code: 'REGISTERED'
          }
        ]
      }
    }
    expect(() => getTimeLoggedFromTask(task)).toThrowError(
      'No time logged extension found in task, task ID: undefined'
    )
  })
  it('Returns false if composition is not a notification', () => {
    const composition = {
      identifier: { system: 'urn:ietf:rfc:3986', value: 'BMPG0QJ' },
      resourceType: 'Composition',
      status: 'preliminary',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-types',
            code: 'birth-application'
          }
        ],
        text: 'Birth Application'
      },
      class: {
        coding: [
          { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
        ],
        text: 'CRVS Document'
      },
      title: 'Birth Application',
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
            { reference: 'urn:uuid:e9ebc455-6737-401a-bbd3-0c76044547db' }
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
            { reference: 'urn:uuid:cd9b2686-a284-4011-b651-f849565060f6' }
          ]
        },
        {
          title: 'Birth encounter',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: 'birth-encounter'
              }
            ],
            text: 'Birth encounter'
          },
          entry: [
            { reference: 'urn:uuid:59dd1b65-a64b-481a-9d3e-aae9b2f5b81f' }
          ]
        }
      ],
      subject: {},
      date: '2019-11-30T15:48:42.833Z',
      author: [],
      id: '9f24f539-8126-4261-baa0-243eea374004'
    }

    expect(isNotification(composition)).toEqual(false)
  })
  it('Returns true if composition is a notification', () => {
    const composition = {
      identifier: { system: 'urn:ietf:rfc:3986', value: 'BMPG0QJ' },
      resourceType: 'Composition',
      status: 'preliminary',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-types',
            code: 'birth-notification'
          }
        ],
        text: 'Birth Application'
      },
      class: {
        coding: [
          { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
        ],
        text: 'CRVS Document'
      },
      title: 'Birth Application',
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
            { reference: 'urn:uuid:e9ebc455-6737-401a-bbd3-0c76044547db' }
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
            { reference: 'urn:uuid:cd9b2686-a284-4011-b651-f849565060f6' }
          ]
        },
        {
          title: 'Birth encounter',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: 'birth-encounter'
              }
            ],
            text: 'Birth encounter'
          },
          entry: [
            { reference: 'urn:uuid:59dd1b65-a64b-481a-9d3e-aae9b2f5b81f' }
          ]
        }
      ],
      subject: {},
      date: '2019-11-30T15:48:42.833Z',
      author: [],
      id: '9f24f539-8126-4261-baa0-243eea374004'
    }

    expect(isNotification(composition)).toEqual(true)
  })
  it('Throws error if no composition type exists', () => {
    const composition = {
      identifier: { system: 'urn:ietf:rfc:3986', value: 'BMPG0QJ' },
      resourceType: 'Composition',
      status: 'preliminary',
      type: {
        coding: [],
        text: 'Birth Application'
      },
      class: {
        coding: [
          { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
        ],
        text: 'CRVS Document'
      },
      title: 'Birth Application',
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
            { reference: 'urn:uuid:e9ebc455-6737-401a-bbd3-0c76044547db' }
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
            { reference: 'urn:uuid:cd9b2686-a284-4011-b651-f849565060f6' }
          ]
        },
        {
          title: 'Birth encounter',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: 'birth-encounter'
              }
            ],
            text: 'Birth encounter'
          },
          entry: [
            { reference: 'urn:uuid:59dd1b65-a64b-481a-9d3e-aae9b2f5b81f' }
          ]
        }
      ],
      subject: {},
      date: '2019-11-30T15:48:42.833Z',
      author: [],
      id: '9f24f539-8126-4261-baa0-243eea374004'
    }

    expect(() => isNotification(composition)).toThrowError(
      'Composition has no type codings defined'
    )
  })
  it('returns practitioner who started the application', () => {
    const taskHistory = require('./test-data/task-history.json')

    expect(getStartedByFieldAgent(taskHistory)).toEqual(
      'fe16875f-3e5f-47bc-85d6-16482a63e7df'
    )
  })
  it('throws error if no task associated with declared or in progress application ', () => {
    const taskHistory = require('./test-data/task-history.json')
    taskHistory.entry[1].resource.businessStatus.coding[0].code = ''

    expect(() => getStartedByFieldAgent(taskHistory)).toThrowError(
      'Task not found!'
    )
  })
})
