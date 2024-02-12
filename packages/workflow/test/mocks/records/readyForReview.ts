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
  RelatedPerson,
  ResourceIdentifier,
  SavedBundle,
  Task,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

export const READY_FOR_REVIEW_BIRTH_RECORD: SavedBundle<
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
        '/fhir/Composition/c8b8e843-c5e0-49b5-96d9-a702ddb46454/_history/eb73319c-4fab-41c5-a508-5eac6154b370' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BQSQASX'
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
                  'RelatedPerson/fdd5e232-9a8c-4e0f-bd0c-ec5fb80f7501' as ResourceIdentifier
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
                  'Patient/cf60f3c7-9ab9-491e-83cd-b6aadc772aa4' as ResourceIdentifier
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
                  'Patient/8cb74e54-1c02-41a7-86a3-415c4031c9ba' as ResourceIdentifier
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
                  'Patient/c42efef3-56c1-4d77-8a2f-b0df78f31a56' as ResourceIdentifier
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
                  'Encounter/2e5b37ef-c3c2-4071-af56-d20a16e87891' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2023-11-30T12:36:27.043Z',
        author: [],
        meta: {
          lastUpdated: '2023-11-30T12:36:27.267+00:00',
          versionId: 'eb73319c-4fab-41c5-a508-5eac6154b370'
        },
        id: 'c8b8e843-c5e0-49b5-96d9-a702ddb46454' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/2e5b37ef-c3c2-4071-af56-d20a16e87891/_history/1b0874ba-2895-4ad2-955a-93f582d3224a' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference:
                'Location/146251e9-df90-4068-82b0-27d8f979e8e2' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2023-11-30T12:36:27.318+00:00',
          versionId: '1b0874ba-2895-4ad2-955a-93f582d3224a'
        },
        id: '2e5b37ef-c3c2-4071-af56-d20a16e87891' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/fdd5e232-9a8c-4e0f-bd0c-ec5fb80f7501/_history/bcd08d79-afa7-4af9-bb5f-872fd4e1dcbb' as URLReference,
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
            'Patient/cf60f3c7-9ab9-491e-83cd-b6aadc772aa4' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2023-11-30T12:36:27.284+00:00',
          versionId: 'bcd08d79-afa7-4af9-bb5f-872fd4e1dcbb'
        },
        id: 'fdd5e232-9a8c-4e0f-bd0c-ec5fb80f7501' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/8cb74e54-1c02-41a7-86a3-415c4031c9ba/_history/32cfc449-29ce-4a14-a806-3f007b7890c8' as URLReference,
      resource: {
        resourceType: 'Patient',
        extension: [],
        active: true,
        name: [
          {
            use: 'en',
            given: ['Salam'],
            family: ['Ahmed']
          }
        ],
        gender: 'male',
        birthDate: '2022-11-10',
        meta: {
          lastUpdated: '2023-11-30T12:36:27.313+00:00',
          versionId: '32cfc449-29ce-4a14-a806-3f007b7890c8'
        },
        id: '8cb74e54-1c02-41a7-86a3-415c4031c9ba' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/c42efef3-56c1-4d77-8a2f-b0df78f31a56/_history/caf97872-2cab-48e3-bc08-a9f71f386504' as URLReference,
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
          lastUpdated: '2023-11-30T12:36:27.316+00:00',
          versionId: 'caf97872-2cab-48e3-bc08-a9f71f386504'
        },
        id: 'c42efef3-56c1-4d77-8a2f-b0df78f31a56' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Patient/cf60f3c7-9ab9-491e-83cd-b6aadc772aa4/_history/4104a428-d7fd-4b71-aa36-ce165fe9a80b' as URLReference,
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
            given: ['Sufiana'],
            family: ['Khatum']
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
        birthDate: '1993-08-09',
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
            district: '0f7684aa-8c65-4901-8318-bf1e22c247cb',
            state: 'ed6195ff-0f83-4852-832e-dc9db07151ff',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb'
                }
              }
            ]
          }
        ],
        meta: {
          lastUpdated: '2023-11-30T12:36:27.292+00:00',
          versionId: '4104a428-d7fd-4b71-aa36-ce165fe9a80b'
        },
        id: 'cf60f3c7-9ab9-491e-83cd-b6aadc772aa4' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/4d67992c-ab35-4e26-a8b9-9447540cca00' as URLReference,
      resource: {
        resourceType: 'Task',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'abc@xyz.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 210764
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/ce73938d-a188-4a78-9d19-35dfd4ca6957'
            }
          }
        ],
        status: 'ready',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '7c3af302-08c9-41af-8701-92de9a71a3e4'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BQSQASX' as TrackingID
          }
        ],
        lastModified: '2023-11-30T12:36:27.043Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
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
          reference: 'Composition/c8b8e843-c5e0-49b5-96d9-a702ddb46454'
        },
        meta: {
          lastUpdated: '2023-11-30T12:36:27.277+00:00',
          versionId: '4d67992c-ab35-4e26-a8b9-9447540cca00'
        },
        id: 'f00e742a-0900-488b-b7c1-9625d7b7e456' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1/_history/4b7aa336-8922-45e3-b1d4-45e25e3d5a6a' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          {
            system: 'phone',
            value: '0911111111'
          },
          {
            system: 'email',
            value: ''
          }
        ],
        name: [
          {
            use: 'en',
            family: 'Bwalya',
            given: ['Kalusha']
          }
        ],
        meta: {
          lastUpdated: '2023-11-29T07:02:39.305+00:00',
          versionId: '4b7aa336-8922-45e3-b1d4-45e25e3d5a6a'
        },
        id: '4651d1cc-6072-4e34-bf20-b583f421a9f1' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/0f7684aa-8c65-4901-8318-bf1e22c247cb/_history/2a913694-3217-4981-9689-a9d4e020a2d5' as URLReference,
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
          reference: 'Location/ed6195ff-0f83-4852-832e-dc9db07151ff'
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
          lastUpdated: '2023-11-29T07:02:38.392+00:00',
          versionId: '2a913694-3217-4981-9689-a9d4e020a2d5'
        },
        id: '0f7684aa-8c65-4901-8318-bf1e22c247cb' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/ce73938d-a188-4a78-9d19-35dfd4ca6957/_history/f3012375-dbd1-4615-a1ef-e9982fa9a2ba' as URLReference,
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
          reference: 'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb'
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
          lastUpdated: '2023-11-29T07:02:38.868+00:00',
          versionId: 'f3012375-dbd1-4615-a1ef-e9982fa9a2ba'
        },
        id: 'ce73938d-a188-4a78-9d19-35dfd4ca6957' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/146251e9-df90-4068-82b0-27d8f979e8e2/_history/95c12c54-4060-4acc-ae47-94b1639e2c3f' as URLReference,
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_FgM7TeHrSiJ'
          }
        ],
        name: 'Water FallsRural Health Centre',
        alias: ['Water FallsRural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/af050fc6-5866-455a-9cd2-6437e34a3fbe'
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
          lastUpdated: '2023-11-29T07:02:38.742+00:00',
          versionId: '95c12c54-4060-4acc-ae47-94b1639e2c3f'
        },
        id: '146251e9-df90-4068-82b0-27d8f979e8e2' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/f845d4fa-71fe-4d99-9f92-e5ed60838d1d/_history/566659dc-347a-4c6a-8516-606db3a95ffe' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'FIELD_AGENT'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"Social Worker"},{"lang":"fr","label":"Travailleur social"}]'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/ce73938d-a188-4a78-9d19-35dfd4ca6957'
          },
          {
            reference: 'Location/0f7684aa-8c65-4901-8318-bf1e22c247cb'
          },
          {
            reference: 'Location/ed6195ff-0f83-4852-832e-dc9db07151ff'
          }
        ],
        meta: {
          lastUpdated: '2023-11-29T07:02:40.052+00:00',
          versionId: '566659dc-347a-4c6a-8516-606db3a95ffe'
        },
        id: 'f845d4fa-71fe-4d99-9f92-e5ed60838d1d' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/ed6195ff-0f83-4852-832e-dc9db07151ff/_history/6f8d39b4-0e82-461d-8c95-c470b34027e2' as URLReference,
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
          lastUpdated: '2023-11-29T07:02:38.369+00:00',
          versionId: '6f8d39b4-0e82-461d-8c95-c470b34027e2'
        },
        id: 'ed6195ff-0f83-4852-832e-dc9db07151ff' as UUID
      }
    }
  ]
}
