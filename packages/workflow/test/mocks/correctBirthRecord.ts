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
  BirthRegistration,
  Bundle,
  Composition,
  Encounter,
  Location,
  Observation,
  Patient,
  Practitioner,
  PractitionerRole,
  QuestionnaireResponse,
  RegistrationNumber,
  RelatedPerson,
  ResourceIdentifier,
  Task,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

export const RECORD_WITH_MOTHER_AS_INFORMANT: Bundle<
  | Composition
  | Encounter
  | Patient
  | RelatedPerson
  | Task
  | Practitioner
  | PractitionerRole
  | Location
  | Observation
  | QuestionnaireResponse
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/Composition/bbe9e950-2e8f-4a39-a0da-3e486f992486/_history/f0ac5884-8bd9-4a2e-8529-f35378411ada' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BSLA1FM'
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
                  'RelatedPerson/61b83d6f-8224-4ad5-ac0d-065cb9881e16' as ResourceIdentifier
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
                  'Patient/cc9fa836-eada-4eed-89b1-5bc51456e1aa' as ResourceIdentifier
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
                  'Patient/5881333d-7762-4129-af1b-8102780f5bc0' as ResourceIdentifier
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
                  'Patient/85e88048-801b-4eb3-9ab9-696ff9f55c95' as ResourceIdentifier
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
                  'Encounter/d81f54b4-4273-4c43-8105-6aa1485d2e3b' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2025-02-17T10:36:39.200Z',
        author: [],
        meta: {
          lastUpdated: '2025-02-17T10:36:39.368+00:00',
          versionId: 'f0ac5884-8bd9-4a2e-8529-f35378411ada'
        },
        id: 'bbe9e950-2e8f-4a39-a0da-3e486f992486' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/d81f54b4-4273-4c43-8105-6aa1485d2e3b/_history/742afe2a-2970-4e16-a4e1-b09df302bb3c' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference:
                'Location/5b76e66e-e19c-418b-ae6f-5bab845ffbc4' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:36:39.385+00:00',
          versionId: '742afe2a-2970-4e16-a4e1-b09df302bb3c'
        },
        id: 'd81f54b4-4273-4c43-8105-6aa1485d2e3b' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/61b83d6f-8224-4ad5-ac0d-065cb9881e16/_history/b0866f80-9824-47c5-96b9-d3334be06b48' as URLReference,
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
            'Patient/cc9fa836-eada-4eed-89b1-5bc51456e1aa' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2025-02-17T10:36:39.373+00:00',
          versionId: 'b0866f80-9824-47c5-96b9-d3334be06b48'
        },
        id: '61b83d6f-8224-4ad5-ac0d-065cb9881e16' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/5881333d-7762-4129-af1b-8102780f5bc0/_history/5b576e79-0a13-4494-9ac0-db99d0bf16d7' as URLReference,
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['CFirst', ''],
            family: ['CLast']
          }
        ],
        gender: 'male',
        birthDate: '2025-02-15',
        meta: {
          lastUpdated: '2025-02-17T10:36:40.273+00:00',
          versionId: '5b576e79-0a13-4494-9ac0-db99d0bf16d7'
        },
        id: '5881333d-7762-4129-af1b-8102780f5bc0' as UUID,
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
            value: '2025BSLA1FM'
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
        '/fhir/Patient/85e88048-801b-4eb3-9ab9-696ff9f55c95/_history/32902212-96ee-44c9-b34a-9dd80572afa4' as URLReference,
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
            given: ['FFirst', ''],
            family: ['FLast']
          }
        ],
        identifier: [
          {
            value: '1232142132',
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
        birthDate: '1997-09-15',
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '',
              '',
              '',
              '',
              '',
              '',
              '',
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
            district: 'b67df8e9-c9b9-480f-b251-1803d9258f56',
            state: '8f1b72d9-406a-4ba6-9320-17a435bb705a',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference:
                    'Location/b67df8e9-c9b9-480f-b251-1803d9258f56' as `Location/${UUID}`
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:36:39.383+00:00',
          versionId: '32902212-96ee-44c9-b34a-9dd80572afa4'
        },
        id: '85e88048-801b-4eb3-9ab9-696ff9f55c95' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/cc9fa836-eada-4eed-89b1-5bc51456e1aa/_history/254af932-69df-4dba-af3d-3640e82dfc2b' as URLReference,
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
            given: ['MFirst', ''],
            family: ['MLast']
          }
        ],
        identifier: [
          {
            value: '0731232132',
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
        birthDate: '1999-08-20',
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: [
              '',
              '',
              '',
              '',
              '',
              '',
              '',
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
            district: 'b67df8e9-c9b9-480f-b251-1803d9258f56',
            state: '8f1b72d9-406a-4ba6-9320-17a435bb705a',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference:
                    'Location/b67df8e9-c9b9-480f-b251-1803d9258f56' as `Location/${UUID}`
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:36:39.375+00:00',
          versionId: '254af932-69df-4dba-af3d-3640e82dfc2b'
        },
        id: 'cc9fa836-eada-4eed-89b1-5bc51456e1aa' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/750185bf-9543-491b-a7fe-b89d3e0a2964/_history/2b51a263-4c32-4ed6-9c08-b446e6faafc1' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        telecom: [
          {
            system: 'phone',
            value: '+260933333333'
          },
          {
            system: 'email',
            value: 'kalushabwalya1.7@gmail.com'
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
          lastUpdated: '2025-02-17T10:30:51.923+00:00',
          versionId: '2b51a263-4c32-4ed6-9c08-b446e6faafc1'
        },
        id: '750185bf-9543-491b-a7fe-b89d3e0a2964' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/70ef98b5-628e-447f-bd7d-2ba9695dc650/_history/06ae0d8b-e7a8-49c9-b1df-0fc59c6823cf' as URLReference,
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
          reference:
            'Location/b67df8e9-c9b9-480f-b251-1803d9258f56' as ResourceIdentifier
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
          lastUpdated: '2025-02-17T10:30:51.100+00:00',
          versionId: '06ae0d8b-e7a8-49c9-b1df-0fc59c6823cf'
        },
        id: '70ef98b5-628e-447f-bd7d-2ba9695dc650' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/5b76e66e-e19c-418b-ae6f-5bab845ffbc4/_history/d4e69482-2893-40f5-95f4-b906683b445c' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_k2kKFAEjPhu'
          }
        ],
        name: 'Human ServiTrust Hospice',
        alias: ['Human ServiTrust Hospice'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference:
            'Location/4dfd52b7-ea10-4ab4-992e-a597ce5284cc' as ResourceIdentifier
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
          lastUpdated: '2025-02-17T10:30:50.867+00:00',
          versionId: 'd4e69482-2893-40f5-95f4-b906683b445c'
        },
        id: '5b76e66e-e19c-418b-ae6f-5bab845ffbc4' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/06da9073-be8e-45e8-aa1d-c91ec42e7a05/_history/9c689215-7463-432d-a14b-5f6fcf5af3ec' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference:
            'Practitioner/750185bf-9543-491b-a7fe-b89d3e0a2964' as ResourceIdentifier
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
            reference:
              'Location/70ef98b5-628e-447f-bd7d-2ba9695dc650' as ResourceIdentifier
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:36:46.597+00:00',
          versionId: '9c689215-7463-432d-a14b-5f6fcf5af3ec'
        },
        id: '06da9073-be8e-45e8-aa1d-c91ec42e7a05' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/QuestionnaireResponse/44cd5c3e-8a34-4299-9c7c-81092adc9e03/_history/276a7e10-4561-4218-9e38-dda255c905f8' as URLReference,
      resource: {
        resourceType: 'QuestionnaireResponse',
        extension: [],
        status: 'completed',
        subject: {
          reference:
            'Encounter/d81f54b4-4273-4c43-8105-6aa1485d2e3b' as ResourceIdentifier
        },
        item: [
          {
            text: 'birth.mother.mother-view-group.motherIdType',
            linkId: '',
            answer: [
              {
                valueString: 'NATIONAL_ID'
              }
            ]
          },
          {
            text: 'birth.father.father-view-group.fatherIdType',
            linkId: '',
            answer: [
              {
                valueString: 'NATIONAL_ID'
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:36:39.386+00:00',
          versionId: '276a7e10-4561-4218-9e38-dda255c905f8'
        },
        id: '44cd5c3e-8a34-4299-9c7c-81092adc9e03' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRoleHistory/06da9073-be8e-45e8-aa1d-c91ec42e7a05/_history/96b6bec4-1bd4-4cfa-92ca-f962cb96893d' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference:
            'Practitioner/750185bf-9543-491b-a7fe-b89d3e0a2964' as ResourceIdentifier
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
            reference:
              'Location/70ef98b5-628e-447f-bd7d-2ba9695dc650' as ResourceIdentifier
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:30:51.929+00:00',
          versionId: '96b6bec4-1bd4-4cfa-92ca-f962cb96893d'
        },
        id: '06da9073-be8e-45e8-aa1d-c91ec42e7a05' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/8f1b72d9-406a-4ba6-9320-17a435bb705a/_history/893ca09c-9149-4d1f-bd77-ea448ea3cad8' as URLReference,
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
          reference: 'Location/0' as ResourceIdentifier
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
              '[{"2007":10},{"2008":10},{"2009":10},{"2010":10},{"2011":10},{"2012":10},{"2013":10},{"2014":10},{"2015":10},{"2016":10},{"2017":10},{"2018":10},{"2019":10},{"2020":10},{"2021":10},{"2022":15},{"2023":20}]'
          }
        ],
        meta: {
          lastUpdated: '2025-02-17T10:30:49.696+00:00',
          versionId: '893ca09c-9149-4d1f-bd77-ea448ea3cad8'
        },
        id: '8f1b72d9-406a-4ba6-9320-17a435bb705a' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/b67df8e9-c9b9-480f-b251-1803d9258f56/_history/c8c99a2d-029a-4dbd-ad3f-72ae93d2dbbc' as URLReference,
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
          reference:
            'Location/8f1b72d9-406a-4ba6-9320-17a435bb705a' as ResourceIdentifier
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
          lastUpdated: '2025-02-17T10:30:49.736+00:00',
          versionId: 'c8c99a2d-029a-4dbd-ad3f-72ae93d2dbbc'
        },
        id: 'b67df8e9-c9b9-480f-b251-1803d9258f56' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/4dfd52b7-ea10-4ab4-992e-a597ce5284cc/_history/d846c1e2-f81f-4ff6-9b4d-5ad947e898c3' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_ntoX1PkiWri'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Isamba',
        alias: ['Isamba'],
        description: 'ntoX1PkiWri',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference:
            'Location/8f1b72d9-406a-4ba6-9320-17a435bb705a' as ResourceIdentifier
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
          lastUpdated: '2025-02-17T10:30:49.746+00:00',
          versionId: 'd846c1e2-f81f-4ff6-9b4d-5ad947e898c3'
        },
        id: '4dfd52b7-ea10-4ab4-992e-a597ce5284cc' as UUID
      }
    },
    {
      fullUrl:
        'urn:uuid:9f4c75b8-10e8-4eea-ae79-a84c3a9e2278' as `urn:uuid:${UUID}`,
      resource: {
        resourceType: 'Encounter',
        status: 'finished'
      }
    },
    {
      resource: {
        resourceType: 'Task',
        status: 'ready',
        intent: 'order',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        focus: {
          reference:
            'Composition/bbe9e950-2e8f-4a39-a0da-3e486f992486' as `Composition/${UUID}`
        },
        id: 'a31f0a2a-8b83-43e3-81c5-d3804fd25256' as UUID,
        encounter: {
          reference: 'urn:uuid:9f4c75b8-10e8-4eea-ae79-a84c3a9e2278'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: 'f2323c71-c6e3-4ac6-89a3-2aabd57a8d6f'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BSLA1FM' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2025BSLA1FM' as RegistrationNumber
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
            url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired',
            valueBoolean: true
          },
          {
            url: 'http://opencrvs.org/specs/extension/requestingIndividual',
            valueString: 'INFORMANT'
          },
          {
            url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
            valueBoolean: true
          },
          {
            url: 'http://opencrvs.org/specs/extension/makeCorrection',
            valueString: 'REGISTERED'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference:
                'Practitioner/750185bf-9543-491b-a7fe-b89d3e0a2964' as `Practitioner/${UUID}`
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference:
                'Location/70ef98b5-628e-447f-bd7d-2ba9695dc650' as `Location/${UUID}`
            }
          }
        ],
        input: [
          {
            valueCode: 'informant',
            valueId: 'informantType',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'MOTHER'
          },
          {
            valueCode: 'informant',
            valueId: 'firstNamesEng',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'MFirst'
          },
          {
            valueCode: 'informant',
            valueId: 'familyNameEng',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'MLast'
          },
          {
            valueCode: 'informant',
            valueId: 'informantBirthDate',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: '1999-08-20'
          },
          {
            valueCode: 'informant',
            valueId: 'exactDateOfBirthUnknown',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: ''
          },
          {
            valueCode: 'informant',
            valueId: 'informantIdType',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: ''
          },
          {
            valueCode: 'informant',
            valueId: 'informantNationalId',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: '0731232132'
          }
        ],
        output: [
          {
            valueCode: 'informant',
            valueId: 'informantType',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'BROTHER'
          },
          {
            valueCode: 'informant',
            valueId: 'firstNamesEng',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'BFirst'
          },
          {
            valueCode: 'informant',
            valueId: 'familyNameEng',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'BLast'
          },
          {
            valueCode: 'informant',
            valueId: 'informantBirthDate',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: '2005-05-18'
          },
          {
            valueCode: 'informant',
            valueId: 'exactDateOfBirthUnknown',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueBoolean: false
          },
          {
            valueCode: 'informant',
            valueId: 'informantIdType',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: 'NATIONAL_ID'
          },
          {
            valueCode: 'informant',
            valueId: 'informantNationalId',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueString: '0723946778'
          }
        ],
        reason: {
          text: 'CLERICAL_ERROR',
          extension: [
            {
              url: 'http://opencrvs.org/specs/extension/otherReason',
              valueString: ''
            }
          ]
        },
        note: [
          {
            text: ''
          }
        ],
        lastModified: '2025-02-17T10:37:59.279Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        }
      }
    }
  ]
}

export const correctionDetails: BirthRegistration = {
  _fhirIDMap: {
    composition: 'bbe9e950-2e8f-4a39-a0da-3e486f992486',
    encounter: 'd81f54b4-4273-4c43-8105-6aa1485d2e3b',
    eventLocation: '5b76e66e-e19c-418b-ae6f-5bab845ffbc4',
    questionnaireResponse: '44cd5c3e-8a34-4299-9c7c-81092adc9e03',
    observation: {}
  },
  registration: {
    _fhirID: 'a31f0a2a-8b83-43e3-81c5-d3804fd25256',
    draftId: 'bbe9e950-2e8f-4a39-a0da-3e486f992486',
    trackingId: 'BSLA1FM',
    registrationNumber: '2025BSLA1FM',
    informantType: 'BROTHER',
    contactEmail: 'abc@xyz.com',
    status: [
      {
        timestamp: '2025-02-17T10:37:59.199Z',
        timeLoggedMS: 36119
      }
    ]
  },
  child: {
    _fhirID: '5881333d-7762-4129-af1b-8102780f5bc0',
    identifier: [],
    name: [
      {
        use: 'en',
        firstNames: 'CFirst',
        familyName: 'CLast'
      }
    ],
    gender: 'male',
    birthDate: '2025-02-15'
  },
  mother: {
    _fhirID: 'cc9fa836-eada-4eed-89b1-5bc51456e1aa',
    identifier: [
      {
        id: '0731232132',
        type: 'NATIONAL_ID'
      }
    ],
    name: [
      {
        use: 'en',
        firstNames: 'MFirst',
        familyName: 'MLast'
      }
    ],
    birthDate: '1999-08-20',
    detailsExist: true,
    address: [
      {
        type: 'PRIMARY_ADDRESS',
        line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        district: 'b67df8e9-c9b9-480f-b251-1803d9258f56',
        state: '8f1b72d9-406a-4ba6-9320-17a435bb705a',
        country: 'FAR',
        partOf: 'b67df8e9-c9b9-480f-b251-1803d9258f56'
      }
    ],
    nationality: ['FAR']
  },
  father: {
    _fhirID: '85e88048-801b-4eb3-9ab9-696ff9f55c95',
    identifier: [
      {
        id: '1232142132',
        type: 'NATIONAL_ID'
      }
    ],
    name: [
      {
        use: 'en',
        firstNames: 'FFirst',
        familyName: 'FLast'
      }
    ],
    birthDate: '1997-09-15',
    detailsExist: true,
    address: [
      {
        type: 'PRIMARY_ADDRESS',
        line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        district: 'b67df8e9-c9b9-480f-b251-1803d9258f56',
        state: '8f1b72d9-406a-4ba6-9320-17a435bb705a',
        country: 'FAR',
        partOf: 'b67df8e9-c9b9-480f-b251-1803d9258f56'
      }
    ],
    nationality: ['FAR']
  },
  informant: {
    identifier: [
      {
        id: '0723946778',
        type: 'NATIONAL_ID'
      }
    ],
    name: [
      {
        use: 'en',
        firstNames: 'BFirst',
        familyName: 'BLast'
      }
    ],
    birthDate: '2005-05-18',
    address: [
      {
        type: 'PRIMARY_ADDRESS',
        line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        district: 'b67df8e9-c9b9-480f-b251-1803d9258f56',
        state: '8f1b72d9-406a-4ba6-9320-17a435bb705a',
        country: 'FAR',
        partOf: 'b67df8e9-c9b9-480f-b251-1803d9258f56'
      }
    ],
    nationality: ['FAR']
  },
  eventLocation: {
    _fhirID: '5b76e66e-e19c-418b-ae6f-5bab845ffbc4'
  },
  questionnaire: [
    {
      fieldId: 'birth.informant.informant-view-group.informantIdType',
      value: 'NATIONAL_ID'
    },
    {
      fieldId: 'birth.mother.mother-view-group.motherIdType',
      value: 'NATIONAL_ID'
    },
    {
      fieldId: 'birth.father.father-view-group.fatherIdType',
      value: 'NATIONAL_ID'
    }
  ],
  createdAt: '2025-02-17T10:37:59.199Z'
}
