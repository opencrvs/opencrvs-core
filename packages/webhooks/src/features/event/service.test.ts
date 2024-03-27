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
  getPermissionsBundle,
  transformBirthBundle
} from '@webhooks/features/event/service'
import {
  RegisteredRecord,
  RegistrationNumber,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

const registeredRecord = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/Composition/0a242b2a-7749-4146-9043-72d8730526d4/_history/b3b9d49a-b66d-46e2-a117-521b08951cf6' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BC7Q9KH'
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
                reference: 'RelatedPerson/cc412b7a-c0c3-4264-b0e5-16fe103fae98'
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
                reference: 'Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef'
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
                  'DocumentReference/b5662f6e-3e08-428f-8fdf-a9912c64c106'
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
                reference: 'Patient/7fc04a24-cf8e-41b3-a63b-fdae03269026'
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
                reference: 'Patient/7666c722-4226-4108-a690-797f18ef3e95'
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
                reference: 'Encounter/0ef20bd5-acc2-45b7-9523-a49fa51f5e8a'
              }
            ]
          }
        ],
        subject: {},
        date: '2024-03-15T12:11:06.597Z',
        author: [],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.901+00:00',
          versionId: 'b3b9d49a-b66d-46e2-a117-521b08951cf6'
        },

        id: '0a242b2a-7749-4146-9043-72d8730526d4' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/0ef20bd5-acc2-45b7-9523-a49fa51f5e8a/_history/343ee122-ae92-48cd-92c1-8010f71cb6ee' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'Location/95a480eb-f6da-4801-ae48-ec18f5c5c468'
            }
          }
        ],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.908+00:00',
          versionId: '343ee122-ae92-48cd-92c1-8010f71cb6ee'
        },
        id: '0ef20bd5-acc2-45b7-9523-a49fa51f5e8a' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/cc412b7a-c0c3-4264-b0e5-16fe103fae98/_history/b69db9dd-fea7-437e-bd4a-de0a25af54ab' as URLReference,
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
          reference: 'Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef'
        },
        meta: {
          lastUpdated: '2024-03-15T12:11:06.905+00:00',
          versionId: 'b69db9dd-fea7-437e-bd4a-de0a25af54ab'
        },
        id: 'cc412b7a-c0c3-4264-b0e5-16fe103fae98' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/7666c722-4226-4108-a690-797f18ef3e95/_history/7c2a3fad-96be-4de8-8a7f-687816350a35' as URLReference,
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
            given: ['Port', ''],
            family: ['Bridge']
          }
        ],
        identifier: [
          {
            value: '2321231232',
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
        birthDate: '1991-02-02',
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
            district: '5faae48b-bdfc-478d-a069-6aa121ad4273',
            state: 'ac602b5e-a0d7-4ca7-85cc-347cf8d4d654',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.907+00:00',
          versionId: '7c2a3fad-96be-4de8-8a7f-687816350a35'
        },
        id: '7666c722-4226-4108-a690-797f18ef3e95' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/7fc04a24-cf8e-41b3-a63b-fdae03269026/_history/448159b0-ad6e-4455-9f17-db60ded2fc87' as URLReference,
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Link', ''],
            family: ['Connector']
          }
        ],
        gender: 'male',
        birthDate: '2023-01-01',
        meta: {
          lastUpdated: '2024-03-15T12:11:06.906+00:00',
          versionId: '448159b0-ad6e-4455-9f17-db60ded2fc87'
        },
        id: '7fc04a24-cf8e-41b3-a63b-fdae03269026' as UUID,
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
            value: '2024BC7Q9KH'
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
        '/fhir/DocumentReference/b5662f6e-3e08-428f-8fdf-a9912c64c106/_history/74f850d9-15cc-48ff-8c6a-0e25b5819c7b' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'f18488e8-2bb4-43d1-b8d7-9ecbc2674294'
        },
        extension: [],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NOTIFICATION_OF_BIRTH'
            }
          ]
        },
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/2f108f21-f929-4971-8179-70216a148c53.png'
            }
          }
        ],
        status: 'current',
        subject: {
          display: 'CHILD'
        },
        meta: {
          lastUpdated: '2024-03-18T17:30:45.818+00:00',
          versionId: '74f850d9-15cc-48ff-8c6a-0e25b5819c7b'
        },
        id: 'b5662f6e-3e08-428f-8fdf-a9912c64c106' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef/_history/1221f4a5-b9de-4d7b-a805-5356240ecd38' as URLReference,
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
            given: ['Data', ''],
            family: ['Flow']
          }
        ],
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
        birthDate: '1992-11-11',
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
            district: '5faae48b-bdfc-478d-a069-6aa121ad4273',
            state: 'ac602b5e-a0d7-4ca7-85cc-347cf8d4d654',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.905+00:00',
          versionId: '1221f4a5-b9de-4d7b-a805-5356240ecd38'
        },
        id: 'dfe07740-7803-49c1-9d36-7d54cbf209ef' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/ae8da160-b998-4680-bac6-e65c1e059ab4/_history/8617736d-aed2-47da-9b93-28186ba7b768' as URLReference,
      resource: {
        resourceType: 'Task',
        status: 'ready',
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
          reference: 'Composition/0a242b2a-7749-4146-9043-72d8730526d4'
        },
        id: 'ae8da160-b998-4680-bac6-e65c1e059ab4' as UUID,
        requester: {
          agent: {
            reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BC7Q9KH' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024BC7Q9KH' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/informants-signature',
            valueString: '/ocrvs/b0e07617-5b44-4078-b3e6-c5eed6d7d1f9.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'mom@mom.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 0
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/04e457a5-5c0f-4efe-b561-825b6005fc37'
            }
          }
        ],
        lastModified: '2024-03-15T12:11:08.269Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-03-15T12:11:08.269Z',
          versionId: '8617736d-aed2-47da-9b93-28186ba7b768'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4/_history/067fa8b5-5f54-40ce-b4b1-17ef55ce302b' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          {
            system: 'phone'
          },
          {
            system: 'email',
            value: ''
          }
        ],
        name: [
          {
            use: 'en',
            given: ['Kennedy'],
            family: 'Mweene'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/employee-signature',
            valueSignature: {
              type: [
                {
                  system: 'urn:iso-astm:E1762-95:2013',
                  code: '1.2.840.10065.1.12.1.13',
                  display: 'Review Signature'
                }
              ],
              when: '2024-02-09T11:58:38.884Z',
              contentType: 'image/png',
              blob: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            }
          }
        ],
        id: 'c1097fa3-770a-48e8-b211-b895a9a2fbf4' as UUID,
        meta: {
          lastUpdated: '2024-02-09T11:58:38.999+00:00',
          versionId: '067fa8b5-5f54-40ce-b4b1-17ef55ce302b'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Location/04e457a5-5c0f-4efe-b561-825b6005fc37/_history/b52332a3-a599-4050-a9b6-bfa2e79c2211' as URLReference,
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
          reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
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
          lastUpdated: '2024-02-09T11:50:51.060+00:00',
          versionId: 'b52332a3-a599-4050-a9b6-bfa2e79c2211'
        },
        id: '04e457a5-5c0f-4efe-b561-825b6005fc37' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/5faae48b-bdfc-478d-a069-6aa121ad4273/_history/c3a1f796-6c36-4282-bbf4-96c09180a1a9' as URLReference,
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
          reference: 'Location/ac602b5e-a0d7-4ca7-85cc-347cf8d4d654'
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
          lastUpdated: '2024-02-09T11:50:50.736+00:00',
          versionId: 'c3a1f796-6c36-4282-bbf4-96c09180a1a9'
        },
        id: '5faae48b-bdfc-478d-a069-6aa121ad4273' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/95a480eb-f6da-4801-ae48-ec18f5c5c468/_history/0a971d23-b7ad-4a2d-ab0d-8ce7be1e972a' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_pXhz0PLiYZX'
          }
        ],
        name: 'Chamakubi Health Post',
        alias: ['Chamakubi Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
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
          lastUpdated: '2024-02-09T11:50:50.771+00:00',
          versionId: '0a971d23-b7ad-4a2d-ab0d-8ce7be1e972a'
        },
        id: '95a480eb-f6da-4801-ae48-ec18f5c5c468' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/183acdb9-819c-4b60-9176-942aedcdfe99/_history/3a3a1a90-1694-4650-8097-72fcfa73fc71' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
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
            reference: 'Location/04e457a5-5c0f-4efe-b561-825b6005fc37'
          },
          {
            reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
          },
          {
            reference: 'Location/ac602b5e-a0d7-4ca7-85cc-347cf8d4d654'
          }
        ],
        id: '183acdb9-819c-4b60-9176-942aedcdfe99' as UUID,
        meta: {
          lastUpdated: '2024-02-09T11:58:39.149+00:00',
          versionId: '3a3a1a90-1694-4650-8097-72fcfa73fc71'
        }
      }
    },
    {
      fullUrl:
        '/fhir/QuestionnaireResponse/b094854a-99f6-442c-a57b-ad38ca94a10a/_history/3658d09d-02fa-4113-ada6-0f1c5ed3681c' as URLReference,
      resource: {
        resourceType: 'QuestionnaireResponse',
        extension: [],
        status: 'completed',
        subject: {
          reference: 'Encounter/0ef20bd5-acc2-45b7-9523-a49fa51f5e8a'
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
          lastUpdated: '2024-03-15T12:11:06.908+00:00',
          versionId: '3658d09d-02fa-4113-ada6-0f1c5ed3681c'
        },
        id: 'b094854a-99f6-442c-a57b-ad38ca94a10a' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/ac602b5e-a0d7-4ca7-85cc-347cf8d4d654/_history/83a9422d-be38-472e-b374-eeef7e48b960' as URLReference,
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
          lastUpdated: '2024-02-09T11:50:50.637+00:00',
          versionId: '83a9422d-be38-472e-b374-eeef7e48b960'
        },
        id: 'ac602b5e-a0d7-4ca7-85cc-347cf8d4d654' as UUID
      }
    }
  ]
} as RegisteredRecord

const nationalIdBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/RelatedPerson/cc412b7a-c0c3-4264-b0e5-16fe103fae98/_history/b69db9dd-fea7-437e-bd4a-de0a25af54ab',
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
          reference: 'Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef'
        },
        meta: {
          lastUpdated: '2024-03-15T12:11:06.905+00:00',
          versionId: 'b69db9dd-fea7-437e-bd4a-de0a25af54ab'
        },
        id: 'cc412b7a-c0c3-4264-b0e5-16fe103fae98'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/7666c722-4226-4108-a690-797f18ef3e95/_history/7c2a3fad-96be-4de8-8a7f-687816350a35',
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
            given: ['Port', ''],
            family: ['Bridge']
          }
        ],
        identifier: [
          {
            value: '2321231232',
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
        birthDate: '1991-02-02',
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
            district: '5faae48b-bdfc-478d-a069-6aa121ad4273',
            state: 'ac602b5e-a0d7-4ca7-85cc-347cf8d4d654',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.907+00:00',
          versionId: '7c2a3fad-96be-4de8-8a7f-687816350a35'
        },
        id: '7666c722-4226-4108-a690-797f18ef3e95'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/7fc04a24-cf8e-41b3-a63b-fdae03269026/_history/448159b0-ad6e-4455-9f17-db60ded2fc87',
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Link', ''],
            family: ['Connector']
          }
        ],
        gender: 'male',
        birthDate: '2023-01-01',
        meta: {
          lastUpdated: '2024-03-15T12:11:06.906+00:00',
          versionId: '448159b0-ad6e-4455-9f17-db60ded2fc87'
        },
        id: '7fc04a24-cf8e-41b3-a63b-fdae03269026',
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
            value: '2024BC7Q9KH'
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
        '/fhir/DocumentReference/b5662f6e-3e08-428f-8fdf-a9912c64c106/_history/74f850d9-15cc-48ff-8c6a-0e25b5819c7b' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'f18488e8-2bb4-43d1-b8d7-9ecbc2674294'
        },
        extension: [],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NOTIFICATION_OF_BIRTH'
            }
          ]
        },
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/2f108f21-f929-4971-8179-70216a148c53.png'
            }
          }
        ],
        status: 'current',
        subject: {
          display: 'CHILD'
        },
        meta: {
          lastUpdated: '2024-03-18T17:30:45.818+00:00',
          versionId: '74f850d9-15cc-48ff-8c6a-0e25b5819c7b'
        },
        id: 'b5662f6e-3e08-428f-8fdf-a9912c64c106' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef/_history/1221f4a5-b9de-4d7b-a805-5356240ecd38',
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
            given: ['Data', ''],
            family: ['Flow']
          }
        ],
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
        birthDate: '1992-11-11',
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
            district: '5faae48b-bdfc-478d-a069-6aa121ad4273',
            state: 'ac602b5e-a0d7-4ca7-85cc-347cf8d4d654',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.905+00:00',
          versionId: '1221f4a5-b9de-4d7b-a805-5356240ecd38'
        },
        id: 'dfe07740-7803-49c1-9d36-7d54cbf209ef'
      }
    },
    {
      fullUrl:
        '/fhir/Task/ae8da160-b998-4680-bac6-e65c1e059ab4/_history/8617736d-aed2-47da-9b93-28186ba7b768',
      resource: {
        resourceType: 'Task',
        status: 'ready',
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
          reference: 'Composition/0a242b2a-7749-4146-9043-72d8730526d4'
        },
        id: 'ae8da160-b998-4680-bac6-e65c1e059ab4',
        requester: {
          agent: {
            reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BC7Q9KH'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024BC7Q9KH'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/informants-signature',
            valueString: '/ocrvs/b0e07617-5b44-4078-b3e6-c5eed6d7d1f9.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'mom@mom.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 0
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/04e457a5-5c0f-4efe-b561-825b6005fc37'
            }
          }
        ],
        lastModified: '2024-03-15T12:11:08.269Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-03-15T12:11:08.269Z',
          versionId: '8617736d-aed2-47da-9b93-28186ba7b768'
        }
      }
    }
  ]
}

const permissionsBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/RelatedPerson/cc412b7a-c0c3-4264-b0e5-16fe103fae98/_history/b69db9dd-fea7-437e-bd4a-de0a25af54ab',
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
          reference: 'Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef'
        },
        meta: {
          lastUpdated: '2024-03-15T12:11:06.905+00:00',
          versionId: 'b69db9dd-fea7-437e-bd4a-de0a25af54ab'
        },
        id: 'cc412b7a-c0c3-4264-b0e5-16fe103fae98'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/7fc04a24-cf8e-41b3-a63b-fdae03269026/_history/448159b0-ad6e-4455-9f17-db60ded2fc87',
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Link', ''],
            family: ['Connector']
          }
        ],
        gender: 'male',
        birthDate: '2023-01-01',
        meta: {
          lastUpdated: '2024-03-15T12:11:06.906+00:00',
          versionId: '448159b0-ad6e-4455-9f17-db60ded2fc87'
        },
        id: '7fc04a24-cf8e-41b3-a63b-fdae03269026',
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
            value: '2024BC7Q9KH'
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
        '/fhir/Patient/dfe07740-7803-49c1-9d36-7d54cbf209ef/_history/1221f4a5-b9de-4d7b-a805-5356240ecd38',
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
            given: ['Data', ''],
            family: ['Flow']
          }
        ],
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
        birthDate: '1992-11-11',
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
            district: '5faae48b-bdfc-478d-a069-6aa121ad4273',
            state: 'ac602b5e-a0d7-4ca7-85cc-347cf8d4d654',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-03-15T12:11:06.905+00:00',
          versionId: '1221f4a5-b9de-4d7b-a805-5356240ecd38'
        },
        id: 'dfe07740-7803-49c1-9d36-7d54cbf209ef'
      }
    },
    {
      fullUrl:
        '/fhir/Task/ae8da160-b998-4680-bac6-e65c1e059ab4/_history/8617736d-aed2-47da-9b93-28186ba7b768',
      resource: {
        resourceType: 'Task',
        status: 'ready',
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
          reference: 'Composition/0a242b2a-7749-4146-9043-72d8730526d4'
        },
        id: 'ae8da160-b998-4680-bac6-e65c1e059ab4',
        requester: {
          agent: {
            reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BC7Q9KH'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024BC7Q9KH'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/informants-signature',
            valueString: '/ocrvs/b0e07617-5b44-4078-b3e6-c5eed6d7d1f9.png'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'mom@mom.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 0
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c1097fa3-770a-48e8-b211-b895a9a2fbf4'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/5faae48b-bdfc-478d-a069-6aa121ad4273'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/04e457a5-5c0f-4efe-b561-825b6005fc37'
            }
          }
        ],
        lastModified: '2024-03-15T12:11:08.269Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-03-15T12:11:08.269Z',
          versionId: '8617736d-aed2-47da-9b93-28186ba7b768'
        }
      }
    }
  ]
}

describe('Webhooks on a birth or death event', () => {
  it('transforms national id integration bundle', () => {
    const bundle = transformBirthBundle(registeredRecord, 'nationalId')

    expect(bundle).toEqual(nationalIdBundle)
  })

  it('transforms webhooks bundle', () => {
    const bundle = getPermissionsBundle(registeredRecord, [
      'child-details',
      'mother-details',
      'informant-details'
    ])

    expect(bundle).toEqual(permissionsBundle)
  })

  it('only includes mother and childs details in the bundle', () => {
    const bundle = getPermissionsBundle(registeredRecord, [
      'child-details',
      'mother-details'
    ])
    const MOTHER_UUID = 'dfe07740-7803-49c1-9d36-7d54cbf209ef'
    const CHILD_UUID = '7fc04a24-cf8e-41b3-a63b-fdae03269026'

    expect(bundle.entry).toHaveLength(3) // child details, mother details and the task
    expect(
      bundle.entry.some((entry) => entry.resource.id === MOTHER_UUID)
    ).toBeTruthy()
    expect(
      bundle.entry.some((entry) => entry.resource.id === CHILD_UUID)
    ).toBeTruthy()
    expect(
      bundle.entry.find(
        (entry) => ![MOTHER_UUID, CHILD_UUID].includes(entry.resource.id)
      )
    ).toMatchObject({ resource: { resourceType: 'Task' } })
  })

  it('only includes informants details and supporting documents in the bundle', () => {
    const bundle = getPermissionsBundle(registeredRecord, [
      'informant-details',
      'supporting-documents'
    ])
    const INFORMANT_UUID = 'cc412b7a-c0c3-4264-b0e5-16fe103fae98'
    const SUPPORTING_DOCS_UUID = 'b5662f6e-3e08-428f-8fdf-a9912c64c106'

    expect(bundle.entry).toHaveLength(3) // informants details, supporting documents and the task
    expect(
      bundle.entry.some((entry) => entry.resource.id === INFORMANT_UUID)
    ).toBeTruthy()
    expect(
      bundle.entry.some((entry) => entry.resource.id === SUPPORTING_DOCS_UUID)
    ).toBeTruthy()
    expect(
      bundle.entry.find(
        (entry) =>
          ![INFORMANT_UUID, SUPPORTING_DOCS_UUID].includes(entry.resource.id)
      )
    ).toMatchObject({ resource: { resourceType: 'Task' } })
  })
})
