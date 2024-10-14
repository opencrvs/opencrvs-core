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
/*
 * This file should contain maintained examples of records in all different states
 * Objects should strictly match our record types and should be used everywhere when running tests
 */

import { RegisteredRecord } from './record'

export const REGISTERED_RECORD = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Composition/c5811d36-934d-40f9-94b4-15194d562e45/c2523361-4e7c-4789-873d-c658784153ac',
      resource: {
        identifier: { system: 'urn:ietf:rfc:3986', value: 'BF6W25K' },
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
            { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
          ],
          text: 'CRVS Document'
        },
        title: 'Birth Declaration',
        section: [
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
              {
                reference:
                  'http://localhost:3447/fhir/RelatedPerson/ba012adf-d37f-4b7e-bc7c-730d9b64969b/d8c058bf-3897-4754-b940-40d44a557ae0'
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
                reference:
                  'http://localhost:3447/fhir/Patient/e95dd00c-8352-4555-8842-edb21c2990b8/6ec933d0-a082-4a3e-9656-36dd1b0c58c9'
              }
            ]
          },
          {
            title: 'Supporting Documents',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'supporting-documents'
                }
              ],
              text: 'Supporting Documents'
            },
            entry: [
              {
                reference:
                  'http://localhost:3447/fhir/DocumentReference/d5a9e9be-4a65-4ba7-827d-69b064e1d2cc/871d275d-adac-4bbf-b268-65047ae1b910'
              },
              {
                reference:
                  'http://localhost:3447/fhir/DocumentReference/52464ef7-e183-4ea2-be33-0652c7056382/1cdadd41-2395-46af-955f-e81e0ecab8f9'
              },
              {
                reference:
                  'http://localhost:3447/fhir/DocumentReference/9b964d6d-198c-4975-83ba-951bb4840900/5e82f40c-c239-422d-b12c-61591aa06bff'
              },
              {
                reference:
                  'http://localhost:3447/fhir/DocumentReference/d14360f1-f266-49b4-b3d2-3e9f880c53b1/5d1ac206-4788-4043-8d34-06be479d971f'
              }
            ]
          },
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
                reference:
                  'http://localhost:3447/fhir/Patient/6a502d84-89e4-4391-a766-ae0e1dd664e3/64b92e05-87eb-42c8-8ff5-ec0365a6b853'
              }
            ]
          },
          {
            title: "Father's details",
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'father-details'
                }
              ],
              text: "Father's details"
            },
            entry: [
              {
                reference:
                  'http://localhost:3447/fhir/Patient/6c007587-be87-41c9-8eb3-b42eb88dbe8c/1c452b30-66d9-4584-a834-5f784514e6c8'
              }
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
              {
                reference:
                  'http://localhost:3447/fhir/Encounter/dac73206-209d-47af-b06d-6704cc0e205e/db976deb-40f2-44aa-af4f-7ba89897b86e'
              }
            ]
          }
        ],
        subject: {},
        date: '2023-08-28T07:10:26.734Z',
        author: [],
        meta: {
          lastUpdated: '2023-08-30T05:29:37.467+00:00',
          versionId: 'c2523361-4e7c-4789-873d-c658784153ac'
        },

        id: 'c5811d36-934d-40f9-94b4-15194d562e45'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/DocumentReference/d5a9e9be-4a65-4ba7-827d-69b064e1d2cc/871d275d-adac-4bbf-b268-65047ae1b910',
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '72b5cd44-096d-40b1-aba0-18596693da26'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/70e68102-9d98-4274-a0ff-10e623cd471c.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NOTIFICATION_OF_BIRTH'
            }
          ]
        },
        subject: { display: 'CHILD' },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.514+00:00',
          versionId: '871d275d-adac-4bbf-b268-65047ae1b910'
        },

        id: 'd5a9e9be-4a65-4ba7-827d-69b064e1d2cc'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/DocumentReference/52464ef7-e183-4ea2-be33-0652c7056382/1cdadd41-2395-46af-955f-e81e0ecab8f9',
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '2e04c6ae-481a-43f9-8569-902cb6704b0f'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/c58726ec-d387-42d5-a476-18192b4a0b01.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NATIONAL_ID'
            }
          ]
        },
        subject: { display: 'MOTHER' },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.531+00:00',
          versionId: '1cdadd41-2395-46af-955f-e81e0ecab8f9'
        },

        id: '52464ef7-e183-4ea2-be33-0652c7056382'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/DocumentReference/9b964d6d-198c-4975-83ba-951bb4840900/5e82f40c-c239-422d-b12c-61591aa06bff',
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'b6dfb074-556e-4ff9-a9df-81e57d865835'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/8461d988-565d-4536-8923-1737e78f62cc.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'PASSPORT'
            }
          ]
        },
        subject: { display: 'FATHER' },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.531+00:00',
          versionId: '5e82f40c-c239-422d-b12c-61591aa06bff'
        },

        id: '9b964d6d-198c-4975-83ba-951bb4840900'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/DocumentReference/d14360f1-f266-49b4-b3d2-3e9f880c53b1/5d1ac206-4788-4043-8d34-06be479d971f',
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'a8c90452-02cc-426d-8ae7-2618c72cb8af'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/d69cd95a-fdca-4378-a6a0-b9c569c7c904.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'PROOF_OF_LEGAL_GUARDIANSHIP'
            }
          ]
        },
        subject: { display: 'LEGAL_GUARDIAN_PROOF' },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.531+00:00',
          versionId: '5d1ac206-4788-4043-8d34-06be479d971f'
        },

        id: 'd14360f1-f266-49b4-b3d2-3e9f880c53b1'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Encounter/dac73206-209d-47af-b06d-6704cc0e205e/db976deb-40f2-44aa-af4f-7ba89897b86e',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'Location/3df07c2d-2bfb-4ad2-a337-334632031677'
            }
          }
        ],
        meta: {
          lastUpdated: '2023-08-30T05:29:37.532+00:00',
          versionId: 'db976deb-40f2-44aa-af4f-7ba89897b86e'
        },

        id: 'dac73206-209d-47af-b06d-6704cc0e205e'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Patient/e95dd00c-8352-4555-8842-edb21c2990b8/6ec933d0-a082-4a3e-9656-36dd1b0c58c9',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          }
        ],
        name: [{ use: 'en', given: ['Natalia'], family: ['Smith'] }],
        birthDate: '2002-04-04',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'S'
            }
          ],
          text: 'SINGLE'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/patient-occupation',
            valueString: 'Truck driver'
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'FAR' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'NO_SCHOOLING'
          }
        ],
        multipleBirthInteger: 3,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '',
              '',
              '',
              '',
              '',
              'URBAN',
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
            district: 'd8d16138-1d3a-42e7-bf85-d7f3f657c5d3',
            state: '0392b2ff-ae52-451a-a21a-7454346bff1a',
            country: 'FAR'
          }
        ],

        meta: {
          lastUpdated: '2023-08-30T05:29:37.499+00:00',
          versionId: '6ec933d0-a082-4a3e-9656-36dd1b0c58c9'
        },

        id: 'e95dd00c-8352-4555-8842-edb21c2990b8'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Patient/6a502d84-89e4-4391-a766-ae0e1dd664e3/64b92e05-87eb-42c8-8ff5-ec0365a6b853',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [{ use: 'en', given: ['John'], family: ['Smith'] }],
        gender: 'male',
        birthDate: '2022-04-04',
        meta: {
          lastUpdated: '2023-08-30T05:29:38.636+00:00',
          versionId: '64b92e05-87eb-42c8-8ff5-ec0365a6b853'
        },
        id: '6a502d84-89e4-4391-a766-ae0e1dd664e3',
        identifier: [
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_REGISTRATION_NUMBER'
                }
              ]
            },
            value: '2023BF6W25K'
          },
          {
            type: { coding: [{ code: 'BIRTH_CONFIGURABLE_IDENTIFIER_1' }] },
            value: ''
          },
          {
            type: { coding: [{ code: 'BIRTH_CONFIGURABLE_IDENTIFIER_2' }] },
            value: ''
          },
          {
            type: { coding: [{ code: 'BIRTH_CONFIGURABLE_IDENTIFIER_3' }] },
            value: ''
          }
        ]
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Patient/6c007587-be87-41c9-8eb3-b42eb88dbe8c/1c452b30-66d9-4584-a834-5f784514e6c8',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567891',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          }
        ],
        name: [{ use: 'en', given: ['Jonathan'], family: ['Smith'] }],
        birthDate: '2000-10-10',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/patient-occupation',
            valueString: 'Blacksmith'
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
            extension: [
              {
                url: 'code',
                valueCodeableConcept: {
                  coding: [{ system: 'urn:iso:std:iso:3166', code: 'FAR' }]
                }
              },
              { url: 'period', valuePeriod: { start: '', end: '' } }
            ]
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'NO_SCHOOLING'
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
              '',
              'URBAN',
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
            district: 'd8d16138-1d3a-42e7-bf85-d7f3f657c5d3',
            state: '0392b2ff-ae52-451a-a21a-7454346bff1a',
            country: 'FAR'
          }
        ],

        meta: {
          lastUpdated: '2023-08-30T05:29:37.532+00:00',
          versionId: '1c452b30-66d9-4584-a834-5f784514e6c8'
        },

        id: '6c007587-be87-41c9-8eb3-b42eb88dbe8c'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/RelatedPerson/ba012adf-d37f-4b7e-bc7c-730d9b64969b/d8c058bf-3897-4754-b940-40d44a557ae0',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'MOTHER'
            }
          ]
        },
        patient: {
          reference:
            'http://localhost:3447/fhir/Patient/e95dd00c-8352-4555-8842-edb21c2990b8/6ec933d0-a082-4a3e-9656-36dd1b0c58c9'
        },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.498+00:00',
          versionId: 'd8c058bf-3897-4754-b940-40d44a557ae0'
        },

        id: 'ba012adf-d37f-4b7e-bc7c-730d9b64969b'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/8dae3f40-70f8-4463-aae1-fd56aec0c8ee/54a2f925-277c-4f33-bf8c-5b483b7943b6',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/c5811d36-934d-40f9-94b4-15194d562e45'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '03d087a0-1e20-4443-aca3-d48461d4d597'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BF6W25K'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2023BF6W25K'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/informants-signature',
            valueString: '/ocrvs/c647d125-68ee-4794-b320-d472aadd8c09.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260745645645'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'informant@example.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 1033703
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/61e07903-bf3c-4bd9-9b20-6cf0e3bb982c'
            }
          }
        ],
        note: [
          {
            text: 'Both mother and father were present',
            time: '2023-08-28T07:10:26.735Z',
            authorString: 'Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
          }
        ],
        lastModified: '2023-08-28T07:10:26.734Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-08-30T05:29:38.606+00:00',
          versionId: '54a2f925-277c-4f33-bf8c-5b483b7943b6'
        },
        id: '8dae3f40-70f8-4463-aae1-fd56aec0c8ee'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab/68e3b145-8aba-4592-a4cc-9461a859cbbb',
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          { system: 'phone', value: '0933333333' },
          { system: 'email', value: '' }
        ],
        name: [{ use: 'en', family: 'Mweene', given: ['Kennedy'] }],
        meta: {
          lastUpdated: '2023-08-30T05:18:31.251+00:00',
          versionId: '68e3b145-8aba-4592-a4cc-9461a859cbbb'
        },

        id: '7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
      }
    },

    {
      fullUrl:
        'http://localhost:3447/fhir/Practitioner/9a3f661c-a2b2-4d76-a47c-7bbdf7f3062e/5c42adfa-8206-41d1-ba27-6d862b354a61',
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/7dc24408-d409-4ec0-bd9d-4a5aa817dcab'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'LOCAL_REGISTRAR'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/61e07903-bf3c-4bd9-9b20-6cf0e3bb982c'
          },
          {
            reference: 'Location/d8d16138-1d3a-42e7-bf85-d7f3f657c5d3'
          },
          {
            reference: 'Location/0392b2ff-ae52-451a-a21a-7454346bff1a'
          }
        ],
        meta: {
          lastUpdated: '2023-08-28T07:00:28.403+00:00',
          versionId: '5c42adfa-8206-41d1-ba27-6d862b354a61'
        },
        _request: {
          method: 'POST'
        },
        id: '9a3f661c-a2b2-4d76-a47c-7bbdf7f3062e'
      }
    },

    {
      fullUrl:
        'http://localhost:3447/fhir/Location/61e07903-bf3c-4bd9-9b20-6cf0e3bb982c/a98a7d00-e195-4799-b00e-4adf9c87618a',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_JWMRGwDBXK'
          }
        ],
        name: 'Ibombo District Office',
        alias: ['Ibombo District Office'],
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/d8d16138-1d3a-42e7-bf85-d7f3f657c5d3' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'CRVS_OFFICE'
            }
          ]
        },
        physicalType: { coding: [{ code: 'bu', display: 'Building' }] },
        meta: {
          lastUpdated: '2023-08-30T05:18:31.252+00:00',
          versionId: 'a98a7d00-e195-4799-b00e-4adf9c87618a'
        },

        id: '61e07903-bf3c-4bd9-9b20-6cf0e3bb982c'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/0392b2ff-ae52-451a-a21a-7454346bff1a/5effda15-a5c0-4151-a605-dbc1a6c488a0',
      resource: {
        _id: '64ec418223aebe001df41bb9',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Central',
        alias: ['Central'],
        description: 'AWn3s2RqgAN',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-08-28T06:41:06.226+00:00',
          versionId: '5effda15-a5c0-4151-a605-dbc1a6c488a0'
        },
        _transforms: {
          meta: {
            lastUpdated: '2023-08-28T06:41:06.226Z'
          }
        },
        _request: {
          method: 'POST'
        },
        id: '0392b2ff-ae52-451a-a21a-7454346bff1a'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/d8d16138-1d3a-42e7-bf85-d7f3f657c5d3/9fe2016d-f7ed-4f55-8c97-6f2476829d1b',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ibombo',
        alias: ['Ibombo'],
        description: 'oEBf29y8JP8',
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/0392b2ff-ae52-451a-a21a-7454346bff1a' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: { coding: [{ code: 'jdn', display: 'Jurisdiction' }] },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-08-30T05:18:31.252+00:00',
          versionId: '9fe2016d-f7ed-4f55-8c97-6f2476829d1b'
        },

        id: 'd8d16138-1d3a-42e7-bf85-d7f3f657c5d3'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/3df07c2d-2bfb-4ad2-a337-334632031677/119ef429-a0c8-46b7-bc36-d5b50035ce77',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_xUFGW5vo7No'
          }
        ],
        name: 'Golden Valley Rural Health Centre',
        alias: ['Golden Valley Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/d8d16138-1d3a-42e7-bf85-d7f3f657c5d3' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: { coding: [{ code: 'bu', display: 'Building' }] },
        meta: {
          lastUpdated: '2023-08-30T05:18:31.255+00:00',
          versionId: '119ef429-a0c8-46b7-bc36-d5b50035ce77'
        },

        id: '3df07c2d-2bfb-4ad2-a337-334632031677'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/7e644b74-077c-4ec8-95e0-ad5a7160f3cf/fa6c9c93-8c17-4548-9c30-b817a73b3923',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/dac73206-209d-47af-b06d-6704cc0e205e'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'procedure',
                display: 'Procedure'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '57722-1',
              display: 'Birth plurality of Pregnancy'
            }
          ]
        },
        valueQuantity: { value: 'TWIN' },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.547+00:00',
          versionId: 'fa6c9c93-8c17-4548-9c30-b817a73b3923'
        },

        id: '7e644b74-077c-4ec8-95e0-ad5a7160f3cf'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/243e3520-e774-41c7-a0e1-1b674528d6f5/97bdacea-1815-49f0-babb-085d103db36a',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/dac73206-209d-47af-b06d-6704cc0e205e'
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
              code: '3141-9',
              display: 'Body weight Measured'
            }
          ]
        },
        valueQuantity: {
          value: 3,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        },
        meta: {
          lastUpdated: '2023-08-30T05:29:37.561+00:00',
          versionId: '97bdacea-1815-49f0-babb-085d103db36a'
        },

        id: '243e3520-e774-41c7-a0e1-1b674528d6f5'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Observation/45cac943-5ffe-4605-8b40-9206b95e8b3b/9b82b9f6-af77-453e-869d-ee5b4912d183',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/dac73206-209d-47af-b06d-6704cc0e205e'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/observation-category',
                code: 'procedure',
                display: 'Procedure'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '73764-3',
              display: 'Birth attendant title'
            }
          ]
        },
        valueString: 'PHYSICIAN',
        meta: {
          lastUpdated: '2023-08-30T05:29:37.561+00:00',
          versionId: '9b82b9f6-af77-453e-869d-ee5b4912d183'
        },

        id: '45cac943-5ffe-4605-8b40-9206b95e8b3b'
      }
    }
  ]
} as RegisteredRecord
