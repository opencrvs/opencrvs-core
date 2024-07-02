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
  Composition,
  Encounter,
  Location,
  Observation,
  Patient,
  Practitioner,
  PractitionerRole,
  RegistrationNumber,
  RelatedPerson,
  ResourceIdentifier,
  SavedBundle,
  Task,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

export const REGISTERED_BIRTH_RECORD: SavedBundle<
  | Composition
  | Encounter
  | Patient
  | RelatedPerson
  | Task
  | Practitioner
  | PractitionerRole
  | Location
  | Observation
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/Composition/7a790b68-9433-47b8-b595-66aae80d044a/_history/20fbf8e0-6d5a-4a7b-a812-0fe4f82016e5' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'B9EKE2K'
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
                  'RelatedPerson/7a661dba-080b-4481-8e1d-ec46b33ed979' as ResourceIdentifier
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
                  'Patient/53f84c51-e087-4011-9d20-f308b0040696' as ResourceIdentifier
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
                  'Patient/25821f78-fe9f-4e52-bba4-bd0809fe3698' as ResourceIdentifier
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
                  'Patient/7e1a2bb0-d738-4668-aacb-ecc72e5d4a58' as ResourceIdentifier
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
                  'Encounter/2add7704-6b78-4e10-91ca-21158d2ef6b0' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2024-01-05T09:34:50.523Z',
        author: [],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.667+00:00',
          versionId: '20fbf8e0-6d5a-4a7b-a812-0fe4f82016e5'
        },
        id: '7a790b68-9433-47b8-b595-66aae80d044a' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/2add7704-6b78-4e10-91ca-21158d2ef6b0/_history/94601b86-03f2-4bc4-826e-1c715bd5bf5f' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference:
                'Location/0e088936-4a22-426e-9beb-4c30bc3a4b4c' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.669+00:00',
          versionId: '94601b86-03f2-4bc4-826e-1c715bd5bf5f'
        },
        id: '2add7704-6b78-4e10-91ca-21158d2ef6b0' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/7a661dba-080b-4481-8e1d-ec46b33ed979/_history/14d11990-4c07-4d9f-8cae-25be3f31761c' as URLReference,
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
            'Patient/53f84c51-e087-4011-9d20-f308b0040696' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2024-01-05T09:34:52.671+00:00',
          versionId: '14d11990-4c07-4d9f-8cae-25be3f31761c'
        },
        id: '7a661dba-080b-4481-8e1d-ec46b33ed979' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/25821f78-fe9f-4e52-bba4-bd0809fe3698/_history/7a5bc612-4482-445e-8606-9b457ae7a56b' as URLReference,
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Jara'],
            family: ['Akhtar']
          }
        ],
        gender: 'female',
        birthDate: '2023-11-11',
        meta: {
          lastUpdated: '2024-01-05T09:34:52.672+00:00',
          versionId: '7a5bc612-4482-445e-8606-9b457ae7a56b'
        },
        id: '25821f78-fe9f-4e52-bba4-bd0809fe3698' as UUID,
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
            value: '2024B9EKE2K'
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_CONFIGURABLE_IDENTIFIER_1'
                }
              ]
            },
            value: ''
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_CONFIGURABLE_IDENTIFIER_2'
                }
              ]
            },
            value: ''
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_CONFIGURABLE_IDENTIFIER_3'
                }
              ]
            },
            value: ''
          }
        ]
      }
    },
    {
      fullUrl:
        '/fhir/Patient/53f84c51-e087-4011-9d20-f308b0040696/_history/68919fdd-0fb5-4e5e-9b8b-f27f37935511' as URLReference,
      resource: {
        resourceType: 'Patient',
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
                      code: 'FAR'
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
        ],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Wonder'],
            family: ['Woman']
          }
        ],
        identifier: [
          {
            value: '1234123421',
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
        birthDate: '1993-11-11',
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
            district: 'c535b9a2-da47-41d0-b0ac-5891e31eeb9f',
            state: '3fba5456-91e9-4a36-951d-d433173203e8',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/c535b9a2-da47-41d0-b0ac-5891e31eeb9f'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.674+00:00',
          versionId: '68919fdd-0fb5-4e5e-9b8b-f27f37935511'
        },
        id: '53f84c51-e087-4011-9d20-f308b0040696' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/7e1a2bb0-d738-4668-aacb-ecc72e5d4a58/_history/b201720b-f819-4714-aefe-6d58342e98d6' as URLReference,
      resource: {
        resourceType: 'Patient',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/reason-not-applying',
            valueString: 'No idea'
          }
        ],
        active: false,
        name: [],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.676+00:00',
          versionId: 'b201720b-f819-4714-aefe-6d58342e98d6'
        },
        id: '7e1a2bb0-d738-4668-aacb-ecc72e5d4a58' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/df49e854-25b3-46b0-b6ea-e2f7f82ea297/_history/a08232a9-e3dc-43e8-8241-6df5d326b9f9' as URLReference,
      resource: {
        resourceType: 'Task',
        status: 'accepted',
        intent: 'proposal',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        focus: {
          reference: 'Composition/7a790b68-9433-47b8-b595-66aae80d044a'
        },
        id: 'df49e854-25b3-46b0-b6ea-e2f7f82ea297' as UUID,
        requester: {
          agent: {
            reference: 'Practitioner/1a3cf855-1132-427f-b125-93c03d79b57f'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '019ca590-7c8f-4153-a8d3-0f0eec7a9a4b'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B9EKE2K' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B9EKE2K' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'abc@xyz.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 0
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/1a3cf855-1132-427f-b125-93c03d79b57f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/c535b9a2-da47-41d0-b0ac-5891e31eeb9f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/0fad590a-41e4-4b82-a9ab-e8f32c2e7e84'
            }
          }
        ],
        lastModified: '2024-01-05T09:34:52.632Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-01-05T09:34:52.688+00:00',
          versionId: 'a08232a9-e3dc-43e8-8241-6df5d326b9f9'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/1a3cf855-1132-427f-b125-93c03d79b57f/_history/6bc85b24-3f70-459e-a21d-02a13e0b3265' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          {
            system: 'phone',
            value: '0933333333'
          },
          {
            system: 'email',
            value: ''
          }
        ],
        name: [
          {
            use: 'en',
            family: 'Mweene',
            given: ['Kennedy']
          }
        ],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.678+00:00',
          versionId: '6bc85b24-3f70-459e-a21d-02a13e0b3265'
        },
        id: '1a3cf855-1132-427f-b125-93c03d79b57f' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/0fad590a-41e4-4b82-a9ab-e8f32c2e7e84/_history/e63bbba2-ae71-47a1-8b24-e62d1b121c00' as URLReference,
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
        partOf: {
          reference: 'Location/c535b9a2-da47-41d0-b0ac-5891e31eeb9f'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'CRVS_OFFICE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-01-05T09:34:52.679+00:00',
          versionId: 'e63bbba2-ae71-47a1-8b24-e62d1b121c00'
        },
        id: '0fad590a-41e4-4b82-a9ab-e8f32c2e7e84' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/c535b9a2-da47-41d0-b0ac-5891e31eeb9f/_history/b38d0c37-c63c-4922-b901-aae6eecbae8c' as URLReference,
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
        partOf: {
          reference: 'Location/3fba5456-91e9-4a36-951d-d433173203e8'
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
              '[{"2007":10},{"2008":10},{"2009":10},{"2010":10},{"2011":10},{"2012":10},{"2013":10},{"2014":10},{"2015":10},{"2016":10},{"2017":10},{"2018":10},{"2019":10},{"2020":10},{"2021":10},{"2022":15},{"2023":20}]'
          }
        ],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.681+00:00',
          versionId: 'b38d0c37-c63c-4922-b901-aae6eecbae8c'
        },
        id: 'c535b9a2-da47-41d0-b0ac-5891e31eeb9f' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/0e088936-4a22-426e-9beb-4c30bc3a4b4c/_history/ba48b3f8-1c94-4183-8831-035ce12e3981' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_Zve7Ecm6Gq5'
          }
        ],
        name: 'SR Brian Memorial Rural Health Centre',
        alias: ['SR Brian Memorial Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/c535b9a2-da47-41d0-b0ac-5891e31eeb9f'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-01-05T09:34:52.683+00:00',
          versionId: 'ba48b3f8-1c94-4183-8831-035ce12e3981'
        },
        id: '0e088936-4a22-426e-9beb-4c30bc3a4b4c' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/ddc17e0c-9301-48a0-b4c4-a3d6b3fe8920/_history/b93f1843-064d-43c3-992d-94752bbf1ddc' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/1a3cf855-1132-427f-b125-93c03d79b57f'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'LOCAL_REGISTRAR'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"Local Registrar"},{"lang":"fr","label":"Registraire local"}]'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/0fad590a-41e4-4b82-a9ab-e8f32c2e7e84'
          },
          {
            reference: 'Location/c535b9a2-da47-41d0-b0ac-5891e31eeb9f'
          },
          {
            reference: 'Location/3fba5456-91e9-4a36-951d-d433173203e8'
          }
        ],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.685+00:00',
          versionId: 'b93f1843-064d-43c3-992d-94752bbf1ddc'
        },
        id: 'ddc17e0c-9301-48a0-b4c4-a3d6b3fe8920' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/3fba5456-91e9-4a36-951d-d433173203e8/_history/56621de2-a3f7-4177-96b2-86680a275b16' as URLReference,
      resource: {
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
        extension: [],
        meta: {
          lastUpdated: '2024-01-05T09:34:52.686+00:00',
          versionId: '56621de2-a3f7-4177-96b2-86680a275b16'
        },
        id: '3fba5456-91e9-4a36-951d-d433173203e8' as UUID
      }
    }
  ]
}
