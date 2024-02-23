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
  DocumentReference,
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

export const CERTIFIED_BIRTH_RECORD: SavedBundle<
  | Composition
  | DocumentReference
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
        '/fhir/Composition/9d377df7-8e18-46ce-b7c2-99393ddf3410/_history/c8cf0a1e-bbf3-4abf-84f5-c36baa661794' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BOEMTJF'
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
                  'RelatedPerson/c84ddc15-e78f-4bcf-8d4d-c60c0dae1655' as ResourceIdentifier
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
                  'Patient/9ed2849b-7055-41c1-be7f-e6bef66da95b' as ResourceIdentifier
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
                  'Patient/3e30e461-5a25-472b-8e1c-13fc4d288897' as ResourceIdentifier
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
                  'Patient/069d6056-982f-49f6-8630-9559ee097bf5' as ResourceIdentifier
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
                  'Encounter/11382465-b873-4813-9413-ea2ace64c41b' as ResourceIdentifier
              }
            ]
          },
          {
            title: 'Certificates',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'certificates'
                }
              ],
              text: 'Certificates'
            },
            entry: [
              {
                reference:
                  'DocumentReference/c808142a-b484-46aa-a666-083ffd22c172' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2024-01-11T07:49:23.095Z',
        author: [],
        meta: {
          lastUpdated: '2024-01-11T07:49:54.022+00:00',
          versionId: 'c8cf0a1e-bbf3-4abf-84f5-c36baa661794'
        },
        id: '9d377df7-8e18-46ce-b7c2-99393ddf3410' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/11382465-b873-4813-9413-ea2ace64c41b/_history/2ba032aa-101a-4807-bd65-bc140a163d5c' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference:
                'Location/8ea98ec2-4698-4582-b0c7-8124d24964a4' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2024-01-11T07:49:25.665+00:00',
          versionId: '2ba032aa-101a-4807-bd65-bc140a163d5c'
        },
        id: '11382465-b873-4813-9413-ea2ace64c41b' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/c84ddc15-e78f-4bcf-8d4d-c60c0dae1655/_history/396a5f89-b614-4c4e-9da8-4229ff9041d3' as URLReference,
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
            'Patient/9ed2849b-7055-41c1-be7f-e6bef66da95b' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2024-01-11T07:49:25.667+00:00',
          versionId: '396a5f89-b614-4c4e-9da8-4229ff9041d3'
        },
        id: 'c84ddc15-e78f-4bcf-8d4d-c60c0dae1655' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/069d6056-982f-49f6-8630-9559ee097bf5/_history/fddf3682-b821-489b-bcfe-9df7cb740c88' as URLReference,
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
          lastUpdated: '2024-01-11T07:49:25.668+00:00',
          versionId: 'fddf3682-b821-489b-bcfe-9df7cb740c88'
        },
        id: '069d6056-982f-49f6-8630-9559ee097bf5' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/3e30e461-5a25-472b-8e1c-13fc4d288897/_history/b7b521f6-22d8-4477-aa67-4ab9fdf84621' as URLReference,
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Bashir'],
            family: ['Khan']
          }
        ],
        gender: 'male',
        birthDate: '2023-12-12',
        meta: {
          lastUpdated: '2024-01-11T07:49:25.673+00:00',
          versionId: 'b7b521f6-22d8-4477-aa67-4ab9fdf84621'
        },
        id: '3e30e461-5a25-472b-8e1c-13fc4d288897' as UUID,
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
            value: '2024BOEMTJF'
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
        '/fhir/Patient/9ed2849b-7055-41c1-be7f-e6bef66da95b/_history/90c92eed-f5af-410a-a89d-d727e50c3916' as URLReference,
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
            given: ['Jane'],
            family: ['Foster']
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
        birthDate: '1992-12-12',
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
            district: 'fe107046-f90b-4c10-a165-827b0c5c8d79',
            state: 'e452aebe-5ce1-43dd-b2cd-d5628ff2b706',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/fe107046-f90b-4c10-a165-827b0c5c8d79'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2024-01-11T07:49:25.675+00:00',
          versionId: '90c92eed-f5af-410a-a89d-d727e50c3916'
        },
        id: '9ed2849b-7055-41c1-be7f-e6bef66da95b' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/DocumentReference/c808142a-b484-46aa-a666-083ffd22c172/_history/e63439e7-6f77-4a3c-bd04-d2defb9d7336' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '0a326397-2fdf-4bea-9bf2-3bf35846a1ad'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/collector',
            valueReference: {
              reference: 'RelatedPerson/219a94d9-92cf-4b7d-a082-368736c4eff5'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
            valueBoolean: true
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/certificate-type',
              code: 'BIRTH'
            }
          ]
        },
        content: [
          {
            attachment: {
              contentType: 'application/pdf',
              data: '/ocrvs/7f089636-aa47-4b46-8971-4c952a3c47e2.pdf'
            }
          }
        ],
        status: 'current',
        meta: {
          lastUpdated: '2024-01-11T07:49:54.020+00:00',
          versionId: 'e63439e7-6f77-4a3c-bd04-d2defb9d7336'
        },
        id: 'c808142a-b484-46aa-a666-083ffd22c172' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/8c80cb66-6068-4ae8-97cb-bb65b75788b9/_history/14e5c6d9-570e-4c4f-aca2-fe84d82361f4' as URLReference,
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
          reference: 'Composition/9d377df7-8e18-46ce-b7c2-99393ddf3410'
        },
        id: '8c80cb66-6068-4ae8-97cb-bb65b75788b9' as UUID,
        requester: {
          agent: {
            reference: 'Practitioner/e46e1ed0-3869-48fe-8c7b-0859647649a7'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: 'd44f6390-7fcb-4659-8baa-98ac99377585'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BOEMTJF' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024BOEMTJF' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'abc@xyz.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/e46e1ed0-3869-48fe-8c7b-0859647649a7'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/fe107046-f90b-4c10-a165-827b0c5c8d79'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/4a9f7b1a-01b9-4ab5-977b-8942b2c20273'
            }
          }
        ],
        lastModified: '2024-01-11T07:49:53.988Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'CERTIFIED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-01-11T07:49:54.026+00:00',
          versionId: '14e5c6d9-570e-4c4f-aca2-fe84d82361f4'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/e46e1ed0-3869-48fe-8c7b-0859647649a7/_history/aceb7848-c305-4fd3-8023-8e1327fa0bd4' as URLReference,
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
          lastUpdated: '2024-01-11T07:49:25.683+00:00',
          versionId: 'aceb7848-c305-4fd3-8023-8e1327fa0bd4'
        },
        id: 'e46e1ed0-3869-48fe-8c7b-0859647649a7' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/4a9f7b1a-01b9-4ab5-977b-8942b2c20273/_history/b7144401-b1c5-4e1a-9caf-5af94cf457db' as URLReference,
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
          reference: 'Location/fe107046-f90b-4c10-a165-827b0c5c8d79'
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
          lastUpdated: '2024-01-11T07:49:25.684+00:00',
          versionId: 'b7144401-b1c5-4e1a-9caf-5af94cf457db'
        },
        id: '4a9f7b1a-01b9-4ab5-977b-8942b2c20273' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/fe107046-f90b-4c10-a165-827b0c5c8d79/_history/3a39313d-a4b3-4bbc-8649-051b6f325184' as URLReference,
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
          reference: 'Location/e452aebe-5ce1-43dd-b2cd-d5628ff2b706'
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
          lastUpdated: '2024-01-11T07:49:25.686+00:00',
          versionId: '3a39313d-a4b3-4bbc-8649-051b6f325184'
        },
        id: 'fe107046-f90b-4c10-a165-827b0c5c8d79' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/8ea98ec2-4698-4582-b0c7-8124d24964a4/_history/6684da46-6ec6-41cb-ad7c-dc105f54f4e7' as URLReference,
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
          reference: 'Location/fe107046-f90b-4c10-a165-827b0c5c8d79'
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
          lastUpdated: '2024-01-11T07:49:25.689+00:00',
          versionId: '6684da46-6ec6-41cb-ad7c-dc105f54f4e7'
        },
        id: '8ea98ec2-4698-4582-b0c7-8124d24964a4' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/219a94d9-92cf-4b7d-a082-368736c4eff5/_history/d68594f8-c814-464f-806a-75a4df417375' as URLReference,
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'INFORMANT'
            }
          ]
        },
        patient: {
          reference:
            'RelatedPerson/c84ddc15-e78f-4bcf-8d4d-c60c0dae1655' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2024-01-11T07:49:54.018+00:00',
          versionId: 'd68594f8-c814-464f-806a-75a4df417375'
        },
        id: '219a94d9-92cf-4b7d-a082-368736c4eff5' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/6cd6c596-2568-4541-bc3c-5464bd8d6b24/_history/1374b119-be0c-40e9-8616-bbe5b58b1363' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/e46e1ed0-3869-48fe-8c7b-0859647649a7'
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
            reference: 'Location/4a9f7b1a-01b9-4ab5-977b-8942b2c20273'
          },
          {
            reference: 'Location/fe107046-f90b-4c10-a165-827b0c5c8d79'
          },
          {
            reference: 'Location/e452aebe-5ce1-43dd-b2cd-d5628ff2b706'
          }
        ],
        meta: {
          lastUpdated: '2024-01-11T07:49:25.691+00:00',
          versionId: '1374b119-be0c-40e9-8616-bbe5b58b1363'
        },
        id: '6cd6c596-2568-4541-bc3c-5464bd8d6b24' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/e452aebe-5ce1-43dd-b2cd-d5628ff2b706/_history/923a909f-2ca0-47a3-8b28-4a3f38eae21e' as URLReference,
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
          lastUpdated: '2024-01-11T07:49:25.693+00:00',
          versionId: '923a909f-2ca0-47a3-8b28-4a3f38eae21e'
        },
        id: 'e452aebe-5ce1-43dd-b2cd-d5628ff2b706' as UUID
      }
    }
  ]
}
