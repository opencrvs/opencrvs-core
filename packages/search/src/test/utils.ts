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
  Saved,
  SavedBundle,
  Task,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

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
export const mockBirthFhirBundle: SavedBundle<
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

export const mockBirthFhirBundleWithoutCompositionId = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2cb0db6-3526-4c2e-aa22-2f8fef9eef46',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BLNMDOY'
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
                reference: 'urn:uuid:d449b644-5c1a-4355-bc82-7473d6a235b8'
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
                reference: 'urn:uuid:afb2ecf4-76d8-46fa-854d-3651130a28db'
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
                reference: 'urn:uuid:f5858402-c61a-48a2-876d-93cf06f876cb'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-27T11:34:46.928Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:412e286c-8839-4f1d-b7c0-4d069b2ec58c',
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
          reference: 'urn:uuid:a2cb0db6-3526-4c2e-aa22-2f8fef9eef46'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01722222222'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-03-27T11:34:48.804Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLNMDOZ'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:d449b644-5c1a-4355-bc82-7473d6a235b8',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            family: ['ম দুই']
          },
          {
            use: 'en',
            family: ['m two']
          }
        ],
        gender: 'male',
        birthDate: '2007-01-01'
      }
    },
    {
      fullUrl: 'urn:uuid:afb2ecf4-76d8-46fa-854d-3651130a28db',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12341234123412341',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['ম ম দুই']
          },
          {
            use: 'en',
            family: ['m m two']
          }
        ],
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        multipleBirthInteger: 1,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
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
    },
    {
      fullUrl: 'urn:uuid:f5858402-c61a-48a2-876d-93cf06f876cb',
      resource: {
        resourceType: 'Encounter',
        status: 'finished'
      }
    },
    {
      fullUrl: 'urn:uuid:4a093653-085d-4064-98b8-4d7508493207',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:f5858402-c61a-48a2-876d-93cf06f876cb'
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
              code: 'present-at-birth-reg',
              display: 'Present at birth registration'
            }
          ]
        },
        valueString: 'MOTHER_ONLY'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-03-27T11:34:46.928Z'
  }
}

export const mockDeathFhirBundle: SavedBundle<
  Saved<
    | Composition
    | Encounter
    | Patient
    | RelatedPerson
    | Location
    | PractitionerRole
    | Practitioner
    | Observation
    | Task
    | DocumentReference
  >
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        '/fhir/Composition/a959c616-934a-4139-a123-37bb4a1be39e/_history/913175fd-b4d6-4636-b8be-2216106d403c' as URLReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'c61c6817-3f9d-4c47-9b52-e99b536bfda3'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'death-declaration'
            }
          ],
          text: 'Death Declaration'
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
        title: 'Death Declaration',
        section: [
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
              {
                reference:
                  'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593' as ResourceIdentifier
              }
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
              {
                reference:
                  'RelatedPerson/7106d752-1e34-47fe-8726-a9fd11042a4d' as ResourceIdentifier
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
                  'DocumentReference/b494d60d-676f-437e-95aa-6ebb7792b58c' as ResourceIdentifier
              },
              {
                reference:
                  'DocumentReference/13a8cc00-189e-4882-9e23-29bc6d7fa735' as ResourceIdentifier
              }
            ]
          },
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
              {
                reference:
                  'Patient/d55283fe-b5bc-497d-86f3-5370957b0642' as ResourceIdentifier
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
                  'Patient/977cee5f-ebbf-4744-a184-ccba8d919d1c' as ResourceIdentifier
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
                  'Patient/d89b25da-edd5-4941-b2dd-84e93868c1a7' as ResourceIdentifier
              }
            ]
          }
        ],
        subject: {},
        date: '2023-08-16T06:55:19.000Z',
        author: [],
        id: 'a959c616-934a-4139-a123-37bb4a1be39e' as UUID,
        extension: [
          {
            url: 'http://opencrvs.org/specs/duplicate',
            valueBoolean: true
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:39:48.057+00:00',
          versionId: '913175fd-b4d6-4636-b8be-2216106d403c'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593/_history/02a4ebde-26ec-4192-8cfc-d032f47b8ec8' as URLReference,
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        id: 'e668f0dc-aacd-45be-bd5f-2a81c3161593' as UUID,
        location: [
          {
            location: {
              reference:
                'Location/4ba43b39-547b-41a8-8af1-c515786f36e5' as ResourceIdentifier
            }
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:39:48.062+00:00',
          versionId: '02a4ebde-26ec-4192-8cfc-d032f47b8ec8'
        }
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/7106d752-1e34-47fe-8726-a9fd11042a4d/_history/50cef67d-a167-436b-af68-384393949b9f' as URLReference,
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'SPOUSE'
            }
          ]
        },
        id: '7106d752-1e34-47fe-8726-a9fd11042a4d' as UUID,
        patient: {
          reference:
            'Patient/9fbbb561-dd3c-4b9f-8765-829a4c75493e' as ResourceIdentifier
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.106+00:00',
          versionId: '50cef67d-a167-436b-af68-384393949b9f'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/977cee5f-ebbf-4744-a184-ccba8d919d1c/_history/e5401779-ca79-49e5-9011-91115560f4c1' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '977cee5f-ebbf-4744-a184-ccba8d919d1c' as UUID,
        name: [
          {
            use: 'en',
            given: [''],
            family: ['Pacocha']
          }
        ],

        meta: {
          lastUpdated: '2023-09-13T12:39:48.125+00:00',
          versionId: 'e5401779-ca79-49e5-9011-91115560f4c1'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/d55283fe-b5bc-497d-86f3-5370957b0642/_history/dcd40b11-003a-4ea5-8f14-11052f549e3d' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: 'd55283fe-b5bc-497d-86f3-5370957b0642' as UUID,
        identifier: [
          {
            value: '8360781537',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'NATIONAL_ID'
                }
              ]
            }
          },
          {
            value: '565195261',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'SOCIAL_SECURITY_NO'
                }
              ]
            }
          },
          {
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'DEATH_REGISTRATION_NUMBER'
                }
              ]
            },
            value: '2023DL1W8FV'
          }
        ],
        name: [
          {
            use: 'en',
            given: ['Zack'],
            family: ['Pacocha']
          }
        ],
        gender: 'female',
        birthDate: '1948-07-24',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/age',
            valueString: 75
          },
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
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['44444 Predovic Mount', '87740', 'URBAN', '', '', 'URBAN'],
            city: 'Rudyboro',
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
            postalCode: '09840-0103',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
                }
              }
            ]
          }
        ],
        deceasedDateTime: '2023-07-24',
        meta: {
          lastUpdated: '2023-09-13T12:39:48.320+00:00',
          versionId: 'dcd40b11-003a-4ea5-8f14-11052f549e3d'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/d89b25da-edd5-4941-b2dd-84e93868c1a7/_history/6e50611f-ccf5-4560-a67c-b0e9f1f58363' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: 'd89b25da-edd5-4941-b2dd-84e93868c1a7' as UUID,
        name: [
          {
            use: 'en',
            given: [''],
            family: ['Pacocha']
          }
        ],

        meta: {
          lastUpdated: '2023-09-13T12:39:48.132+00:00',
          versionId: '6e50611f-ccf5-4560-a67c-b0e9f1f58363'
        }
      }
    },
    {
      fullUrl:
        '/fhir/DocumentReference/13a8cc00-189e-4882-9e23-29bc6d7fa735/_history/e1f017d5-f4e4-4aef-bff9-d27c118c1b82' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'f0d0ff44-1dc5-435e-a8cf-7a11fb8fc663'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/02b19c1f-a9d7-4135-afe4-e80ea9d5100e.png'
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
        subject: {
          display: 'DECEASED_ID_PROOF'
        },

        meta: {
          lastUpdated: '2023-09-13T12:39:48.053+00:00',
          versionId: 'e1f017d5-f4e4-4aef-bff9-d27c118c1b82'
        },
        id: '13a8cc00-189e-4882-9e23-29bc6d7fa735' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/DocumentReference/b494d60d-676f-437e-95aa-6ebb7792b58c/_history/f38dcdd1-5329-4922-a959-0c5405933eca' as URLReference,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: '5e642507-570d-4ba2-99e9-20e962376152'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: '/ocrvs/d40e904b-53ff-4639-bdcf-a2ba8fb236f5.png'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'OTHER'
            }
          ]
        },
        subject: {
          display: 'INFORMANT_ID_PROOF'
        },

        meta: {
          lastUpdated: '2023-09-13T12:39:48.051+00:00',
          versionId: 'f38dcdd1-5329-4922-a959-0c5405933eca'
        },
        id: 'b494d60d-676f-437e-95aa-6ebb7792b58c' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/b1a6925a-47ae-431e-8f61-4cd0929e8518/_history/c047e6ad-d615-4d51-986f-92f2c80e59a9' as URLReference,
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        focus: {
          reference:
            'Composition/a959c616-934a-4139-a123-37bb4a1be39e' as ResourceIdentifier
        },
        id: 'b1a6925a-47ae-431e-8f61-4cd0929e8518' as UUID,
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DL1W8FV' as TrackingID
          },
          {
            system: 'http://opencrvs.org/specs/id/death-registration-number',
            value: '2023DL1W8FV' as RegistrationNumber
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'SPOUSE'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260734085893'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'Frank24@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 986665
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/e9e1b362-27c9-4ce1-82ad-57fe9d5650e4'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/525094f5-3c5f-4e72-af3b-adda8617839f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regViewed'
          }
        ],
        lastModified: '2023-09-22T11:52:48.439Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-22T11:52:48.611+00:00',
          versionId: 'c047e6ad-d615-4d51-986f-92f2c80e59a9'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/9fbbb561-dd3c-4b9f-8765-829a4c75493e/_history/02480691-fba2-4a6d-8b04-4b28deeae3ca' as URLReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        id: '9fbbb561-dd3c-4b9f-8765-829a4c75493e' as UUID,
        identifier: [
          {
            value: '2464716794',
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
        name: [
          {
            use: 'en',
            given: ['Frank'],
            family: ['Pacocha']
          }
        ],
        birthDate: '2003-08-16',
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/patient-occupation',
            valueString: 'consultant'
          },
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
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['817 Avis Point', '06074', 'URBAN', '', '', 'URBAN'],
            city: 'New Julio',
            district: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a',
            state: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b',
            postalCode: '24575',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
                }
              }
            ]
          }
        ],

        meta: {
          lastUpdated: '2023-09-13T12:39:48.119+00:00',
          versionId: '02480691-fba2-4a6d-8b04-4b28deeae3ca'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/3d196967-7c4a-4807-ad42-13b4b2ca43a3/_history/de3aaad3-002c-4d26-a393-e0843d9d43f9' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
        id: '3d196967-7c4a-4807-ad42-13b4b2ca43a3' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/manner-of-death',
              code: 'NATURAL_CAUSES'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.066+00:00',
          versionId: 'de3aaad3-002c-4d26-a393-e0843d9d43f9'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/d5c9d991-69c1-4269-baec-77b5667f2eea/_history/ef12ac6e-ab73-457a-8221-ae5e9fedb386' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'lay-reported-or-verbal-autopsy-description',
              display: 'Lay reported or verbal autopsy description'
            }
          ]
        },
        id: 'd5c9d991-69c1-4269-baec-77b5667f2eea' as UUID,
        meta: {
          lastUpdated: '2023-09-13T12:39:48.071+00:00',
          versionId: 'ef12ac6e-ab73-457a-8221-ae5e9fedb386'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/ff9a538b-c551-4edc-9631-fa2169a37f20/_history/b6b4f8e4-6363-4392-a0f0-38b70fa378d1' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'cause-of-death-method',
              display: 'Cause of death method'
            }
          ]
        },
        id: 'ff9a538b-c551-4edc-9631-fa2169a37f20' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/cause-of-death-method',
              code: 'PHYSICIAN'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.079+00:00',
          versionId: 'b6b4f8e4-6363-4392-a0f0-38b70fa378d1'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/fb98ff5b-3aa1-40c2-87bf-4bd6df091dd2/_history/9362f1f8-2e9f-49ee-a65e-7851b246b28f' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'cause-of-death-established',
              display: 'Cause of death established'
            }
          ]
        },
        id: 'fb98ff5b-3aa1-40c2-87bf-4bd6df091dd2' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/cause-of-death-established',
              code: 'true'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.085+00:00',
          versionId: '9362f1f8-2e9f-49ee-a65e-7851b246b28f'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/3cae74a3-042c-4faf-9dde-8b716d094033/_history/2d331243-3674-4edc-99c3-c74764d726b2' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
        id: '3cae74a3-042c-4faf-9dde-8b716d094033' as UUID,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/cause-of-death',
              code: 'Natural cause'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-09-13T12:39:48.090+00:00',
          versionId: '2d331243-3674-4edc-99c3-c74764d726b2'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/5965002b-52a6-40b4-b95e-5e84b48e3042/_history/98c0a9b1-bba4-47e8-a977-ed8ab288bf8b' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'num-male-dependents-on-deceased',
              display: 'Number of male dependents on Deceased'
            }
          ]
        },
        id: '5965002b-52a6-40b4-b95e-5e84b48e3042' as UUID,
        valueString: 3,
        meta: {
          lastUpdated: '2023-09-13T12:39:48.094+00:00',
          versionId: '98c0a9b1-bba4-47e8-a977-ed8ab288bf8b'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Observation/fbaa8c21-2b9f-48c7-bb09-b15911685b31/_history/55c1d789-3a56-4075-b8d5-4c81eb7bab3b' as URLReference,
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/e668f0dc-aacd-45be-bd5f-2a81c3161593'
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
              code: 'num-female-dependents-on-deceased',
              display: 'Number of female dependents on Deceased'
            }
          ]
        },
        id: 'fbaa8c21-2b9f-48c7-bb09-b15911685b31' as UUID,
        valueString: 4,
        meta: {
          lastUpdated: '2023-09-13T12:39:48.098+00:00',
          versionId: '55c1d789-3a56-4075-b8d5-4c81eb7bab3b'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/525094f5-3c5f-4e72-af3b-adda8617839f/_history/079ca353-4f47-426d-ae60-feb517e66e71' as URLReference,
      resource: {
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          {
            system: 'phone',
            value: '0922222222'
          },
          {
            system: 'email',
            value: ''
          }
        ],
        name: [
          {
            use: 'en',
            family: 'Katongo',
            given: ['Felix']
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:12.149+00:00',
          versionId: '079ca353-4f47-426d-ae60-feb517e66e71'
        },
        id: '525094f5-3c5f-4e72-af3b-adda8617839f' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a/_history/df1ba3bc-0ec3-4f5f-81ee-8a635019de0c' as URLReference,
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
            'Location/1cfe40fa-7b43-4c1e-aa05-4281e5122d9b' as ResourceIdentifier
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
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:07.426+00:00',
          versionId: 'df1ba3bc-0ec3-4f5f-81ee-8a635019de0c'
        },
        id: 'e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/e9e1b362-27c9-4ce1-82ad-57fe9d5650e4/_history/ebe887c3-35fd-4af3-9163-c4decf93797f' as URLReference,
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
            'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as ResourceIdentifier
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
          lastUpdated: '2023-09-13T12:36:08.749+00:00',
          versionId: 'ebe887c3-35fd-4af3-9163-c4decf93797f'
        },
        id: 'e9e1b362-27c9-4ce1-82ad-57fe9d5650e4' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/4ba43b39-547b-41a8-8af1-c515786f36e5/_history/c0bb92c4-1dc9-4d78-aaac-8ea8cd8965cc' as URLReference,
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
        partOf: {
          reference:
            'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a' as ResourceIdentifier
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
          lastUpdated: '2023-09-13T12:36:07.562+00:00',
          versionId: 'c0bb92c4-1dc9-4d78-aaac-8ea8cd8965cc'
        },
        id: '4ba43b39-547b-41a8-8af1-c515786f36e5' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/42ed0f8d-38b0-448d-992f-a85283e32bcf/_history/6e28e902-c96e-4139-9b59-ce1fdcd757f1' as URLReference,
      resource: {
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/525094f5-3c5f-4e72-af3b-adda8617839f'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'REGISTRATION_AGENT'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"Registration Agent"},{"lang":"fr","label":"Agent d\'enregistrement"}]'
              }
            ]
          }
        ],
        location: [
          {
            reference: 'Location/e9e1b362-27c9-4ce1-82ad-57fe9d5650e4'
          },
          {
            reference: 'Location/e66643ac-9ea9-4314-b842-f4fb3ad9e83a'
          },
          {
            reference: 'Location/1cfe40fa-7b43-4c1e-aa05-4281e5122d9b'
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:13.834+00:00',
          versionId: '6e28e902-c96e-4139-9b59-ce1fdcd757f1'
        },
        id: '42ed0f8d-38b0-448d-992f-a85283e32bcf' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Location/1cfe40fa-7b43-4c1e-aa05-4281e5122d9b/_history/585dad70-a478-43af-8bb6-07b7f67f998d' as URLReference,
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
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-13T12:36:07.387+00:00',
          versionId: '585dad70-a478-43af-8bb6-07b7f67f998d'
        },
        id: '1cfe40fa-7b43-4c1e-aa05-4281e5122d9b' as UUID
      }
    }
  ]
}
export const mockDeathFhirBundleWithoutCompositionId = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'DH86EY1'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'death-declaration'
            }
          ],
          text: 'Death Declaration'
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
        title: 'Death Declaration',
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
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
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
              {
                reference: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea'
              }
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
              {
                reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-19T13:05:13.524Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
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
    },
    {
      fullUrl: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'EXTENDED_FAMILY'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:16d007fa-e516-4f71-8c4e-671c39274d1d'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:16d007fa-e516-4f71-8c4e-671c39274d1d',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '123123123',
            type: 'PASSPORT'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '01711111115'
          }
        ],
        address: [
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
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
    },
    {
      fullUrl: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/ee72f497-343f-4f0f-9062-d618fafc175c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:3cf94b36-1bba-4914-89ed-1e57230aba47',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
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
      fullUrl: 'urn:uuid:cd9330bb-f406-464b-9508-253c727feb31',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DH86EY1'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'EXTENDED_FAMILY'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111114'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-03-19T13:05:19.260Z'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-03-19T13:05:13.524Z'
  }
}

export const mockComposition: fhir.Composition = {
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: '{{urn_uuid}}'
  },
  resourceType: 'Composition',
  status: 'preliminary',
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/types',
        code: 'birth-registration'
      }
    ],
    text: 'Birth Registration'
  },
  class: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/classes',
        code: 'crvs-document'
      }
    ],
    text: 'CRVS Document'
  },
  subject: {
    reference: 'Patient/xyz' // A reference to the person being registered, by fullUrl
  },
  date: '{{logicalCompositionDate}}', // declaration date
  author: [
    {
      reference: 'Practitioner/xyz' // CHW that declared the event
    }
  ],
  title: 'Birth Registration',
  section: [
    {
      title: 'Child details',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'child-details'
          }
        ],
        text: 'Child details'
      },
      text: {
        status: '',
        div: ''
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        },
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Mother's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'mother-details'
          }
        ],
        text: "Mother's details"
      },
      text: {
        status: '',
        div: ''
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Father's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'father-details'
          }
        ],
        text: "Father's details"
      },
      text: {
        status: '',
        div: ''
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: "Informant's details",
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'informant-details'
          }
        ],
        text: "Informant's details"
      },
      text: {
        status: '',
        div: ''
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to a Patient resource contained below, by fullUrl
        }
      ]
    },

    {
      title: 'Birth Encounter',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'birth-encounter'
          }
        ],
        text: 'Birth encounter'
      },
      text: {
        status: '',
        div: ''
      },
      entry: [
        {
          reference: 'urn:uuid:xxx' // reference to Encounter resource contained below
        }
      ]
    },

    {
      title: 'Supporting documents',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'supporting-documents'
          }
        ],
        text: 'Supporting documents'
      },
      text: {
        status: '',
        div: ''
      },
      entry: [
        {
          reference: 'DocumentReference/xxx' // reference to a DocumentReference resource contained below
        },
        {
          reference: 'DocumentReference/yyy' // reference to a DocumentReference resource contained below
        },
        {
          reference: 'DocumentReference/zzz' // reference to a DocumentReference resource contained below
        }
      ]
    }
  ],
  relatesTo: [
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/xyz'
      }
    },
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/abc'
      }
    }
  ]
}

export const mockOperationHistory = [
  {
    operatedOn: '2024-01-26T10:42:30.675Z',
    operatorFirstNames: 'Kalusha',
    operatorFamilyNameLocale: '',
    operatorFamilyName: 'Bwalya',
    operatorFirstNamesLocale: '',
    operatorOfficeName: 'Ibombo District Office',
    operatorOfficeAlias: ['Ibombo District Office'],
    operationType: 'DECLARED',
    operatorRole: 'Social Worker'
  },
  {
    operatedOn: '2024-01-30T09:23:00.918Z',
    operatorFirstNames: 'Kennedy',
    operatorFamilyNameLocale: '',
    operatorFamilyName: 'Mweene',
    operatorFirstNamesLocale: '',
    operatorOfficeName: 'Ibombo District Office',
    operatorOfficeAlias: ['Ibombo District Office'],
    operationType: 'WAITING_VALIDATION',
    operatorRole: 'Local Registrar'
  }
]

export const mockSearchResponse = {
  body: {
    hits: {
      total: 2,
      max_score: 2.7509375,
      hits: [
        {
          _index: 'ocrvs',
          _type: 'compositions',
          _id: 'c99e8d62-335e-458d-9fcc-45ec5836c404',
          _score: 2.7509375,
          _source: {
            childFirstNames: '',
            childFamilyName: 'sarkar',
            childFirstNamesLocal: 'test',
            childFamilyNameLocal: 'সরকার',
            childDoB: '1990-02-01',
            motherFirstNames: '',
            motherFamilyName: 'sarkar',
            motherFirstNamesLocal: 'চট্টগ্রাম',
            motherFamilyNameLocal: 'সরকার',
            motherDoB: '1960-02-01',
            motherIdentifier: '22123123123123123',
            createdBy: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
            updatedBy: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
            operationHistories: mockOperationHistory
          }
        }
      ]
    }
  }
}

export const mockSearchResponseWithoutCreatedBy = {
  body: {
    hits: {
      total: 2,
      max_score: 2.7509375,
      hits: [
        {
          _index: 'ocrvs',
          _type: 'compositions',
          _id: 'c99e8d62-335e-458d-9fcc-45ec5836c404',
          _score: 2.7509375,
          _source: {
            childFirstNames: '',
            childFamilyName: 'sarkar',
            childFirstNamesLocal: 'test',
            childFamilyNameLocal: 'সরকার',
            childDoB: '1990-02-01',
            motherFirstNames: '',
            motherFamilyName: 'sarkar',
            motherFirstNamesLocal: 'চট্টগ্রাম',
            motherFamilyNameLocal: 'সরকার',
            motherDoB: '1960-02-01',
            motherIdentifier: '22123123123123123'
          }
        }
      ]
    }
  }
}

export const mockCompositionBody = {
  childFirstNames: 'hasan',
  childFamilyName: 'sarkar',
  childFirstNamesLocal: 'test',
  childFamilyNameLocal: 'সরকার',
  childDoB: '1990-02-01',
  gender: 'male',
  motherFirstNames: 'anninda',
  motherFamilyName: 'sarkar',
  motherFirstNamesLocal: 'চট্টগ্রাম',
  motherFamilyNameLocal: 'সরকার',
  fatherFirstNames: 'raihan',
  fatherFamilyName: 'khilzee',
  fatherDoB: '1960-02-01',
  motherDoB: '1960-02-01',
  motherIdentifier: '22123123123123123',
  fatherIdentifier: '221211111113123123'
}

export const mockCompositionEntry = {
  resourceType: 'Bundle',
  id: '9c0dde8d-65b2-49dd-8b7e-5dd0c7c63779',
  meta: {
    lastUpdated: '2019-01-14T10:58:20.694+00:00'
  },
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Composition?identifier=Bt40VoY'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Composition/7b381f4e-2864-441a-9146-faa3929eeaa8',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'Bt40VoY'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        id: '489b76cf-6b58-4b0d-96ba-caa1271f787b'
      }
    }
  ]
}

export const mockCompositionResponse = {
  identifier: { system: 'urn:ietf:rfc:3986', value: 'BLURQJG' },
  resourceType: 'Composition',
  status: 'preliminary',
  type: {
    coding: [
      { system: 'http://opencrvs.org/doc-types', code: 'birth-declaration' }
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
      title: 'Child details',
      code: {
        coding: [
          { system: 'http://opencrvs.org/doc-sections', code: 'child-details' }
        ],
        text: 'Child details'
      },
      entry: [{ reference: 'urn:uuid:fc3fd2df-92cc-452d-855f-5277396f9cce' }]
    },
    {
      title: "Mother's details",
      code: {
        coding: [
          { system: 'http://opencrvs.org/doc-sections', code: 'mother-details' }
        ],
        text: "Mother's details"
      },
      entry: [{ reference: 'urn:uuid:feb86ab7-437a-43e7-8d10-7fad17cda5f9' }]
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
      entry: [{ reference: 'urn:uuid:6077ab73-2e55-4aa8-8b85-f733c44c1b77' }]
    }
  ],
  subject: {},
  date: '2019-04-02T11:22:46.135Z',
  author: [],
  id: '9acd5bb1-696c-4fdf-ad3a-59c75634ea69',
  relatesTo: [
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/ff6a4fce-4e72-463c-a6aa-718054643983'
      }
    },
    {
      code: 'duplicate',
      targetReference: {
        reference: 'Composition/3a092303-6ecd-46db-b0b3-fa236964ba32'
      }
    }
  ],
  meta: {
    lastUpdated: '201$-04-02T12:56:18.460+00:00',
    versionId: '074c1544-7f3a-4825-816d-8d8fff90934f'
  }
}

export const mockTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/e849ceb4-0adc-4be2-8fc8-8a4c41781bb5',
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
        id: 'e849ceb4-0adc-4be2-8fc8-8a4c41781bb5'
      }
    }
  ]
}

export const mockBirthRejectionTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/16b3a085-0cf8-40db-8213-58ecc8f72790/_history/99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e',
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
          reference: 'Composition/d6667198-3581-4beb-b9a6-52b93aee3159'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01722222222'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
            }
          },
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
          }
        ],
        lastModified: '2019-03-27T11:40:09.493Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLNMDOZ'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        meta: {
          lastUpdated: '2019-03-27T11:34:48.970+00:00',
          versionId: '99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e'
        },
        id: '16b3a085-0cf8-40db-8213-58ecc8f72790',
        note: [
          {
            text: 'reason=duplicate&comment=Possible Duplicate found!',
            time: 'Wed, 27 Mar 2019 11:40:09 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockBirthRejectionTaskBundleWithoutCompositionReference = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/16b3a085-0cf8-40db-8213-58ecc8f72790/_history/99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e',
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
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01722222222'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
            }
          },
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
          }
        ],
        lastModified: '2019-03-27T11:40:09.493Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BLNMDOZ'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        meta: {
          lastUpdated: '2019-03-27T11:34:48.970+00:00',
          versionId: '99c8a143-675e-4a5c-a6d7-aaa5f10e8b9e'
        },
        id: '16b3a085-0cf8-40db-8213-58ecc8f72790',
        note: [
          {
            text: 'reason=duplicate&comment=Possible Duplicate found!',
            time: 'Wed, 27 Mar 2019 11:40:09 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockDeathRejectionTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a/_history/57a41663-6f07-42b7-9cce-c2945ddd3a0c',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        focus: {
          reference: 'Composition/37df1f45-0b27-43da-aebb-8041a73cb103'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DKCGBVI'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
            }
          },
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
          }
        ],
        lastModified: '2019-03-27T11:44:41.407Z',
        meta: {
          lastUpdated: '2019-03-27T11:38:44.701+00:00',
          versionId: '57a41663-6f07-42b7-9cce-c2945ddd3a0c'
        },
        id: 'be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a',
        note: [
          {
            text: 'reason=missing_supporting_doc&comment=No documents found!',
            time: 'Wed, 27 Mar 2019 11:44:41 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockMarriageRejectionTaskBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a/_history/57a41663-6f07-42b7-9cce-c2945ddd3a0c',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'MARRIAGE'
            }
          ]
        },
        focus: {
          reference: 'Composition/37df1f45-0b27-43da-aebb-8041a73cb103'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/marriage-tracking-id',
            value: 'DKCGBVI'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
            }
          },
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
          }
        ],
        lastModified: '2019-03-27T11:44:41.407Z',
        meta: {
          lastUpdated: '2019-03-27T11:38:44.701+00:00',
          versionId: '57a41663-6f07-42b7-9cce-c2945ddd3a0c'
        },
        id: 'be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a',
        note: [
          {
            text: 'reason=missing_supporting_doc&comment=No documents found!',
            time: 'Wed, 27 Mar 2019 11:44:41 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockDeathRejectionTaskBundleWithoutCompositionReference = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a/_history/57a41663-6f07-42b7-9cce-c2945ddd3a0c',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DKCGBVI'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REJECTED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
            }
          },
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
          }
        ],
        lastModified: '2019-03-27T11:44:41.407Z',
        meta: {
          lastUpdated: '2019-03-27T11:38:44.701+00:00',
          versionId: '57a41663-6f07-42b7-9cce-c2945ddd3a0c'
        },
        id: 'be13e81f-0cd7-4ff3-a2d3-a1bc7a7f543a',
        note: [
          {
            text: 'reason=missing_supporting_doc&comment=No documents found!',
            time: 'Wed, 27 Mar 2019 11:44:41 GMT',
            authorString: 'Practitioner/220ad6b8-346f-4a1d-8a5c-086ce38067c9'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Task'
      }
    }
  ]
}

export const mockSearchResult = {
  body: {
    took: 1,
    timed_out: false,
    _shards: {
      total: 10,
      successful: 10,
      skipped: 0,
      failed: 0
    },
    hits: {
      total: 6,
      max_score: 1,
      hits: [
        {
          _index: 'ocrvs',
          _type: 'compositions',
          _id: 'BGM9CA2',
          _score: 1,
          _source: {
            event: 'BIRTH',
            childFamilyName: 'Moajjem',
            childFamilyNameLocal: 'মোয়াজ্জেম',
            declarationLocationId: '123',
            childDoB: '2011-11-11',
            gender: 'male',
            motherFamilyName: 'Moajjem',
            motherFamilyNameLocal: 'মোয়াজ্জেম',
            motherIdentifier: '11111111111111111'
          }
        },
        {
          _index: 'ocrvs',
          _type: 'compositions',
          _id: 'DGM9CA2',
          _score: 1,
          _source: {
            event: 'DEATH',
            deceasedFamilyName: 'Moajjem',
            deceasedFamilyNameLocal: 'মোয়াজ্জেম',
            declarationLocationId: '123',
            deceasedDoB: '2011-11-11',
            gender: 'male',
            motherFamilyName: 'Moajjem',
            motherFamilyNameLocal: 'মোয়াজ্জেম',
            motherIdentifier: '11111111111111111'
          }
        }
      ]
    }
  }
}

export const mockAggregationSearchResult = {
  body: {
    aggregations: {
      statusCounts: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [{ key: 'REGISTERED', doc_count: 1 }]
      }
    }
  }
}

export const mockBirthFhirBundleWithoutParents = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:bcf4e631-ba4f-447b-b630-993709a38d71',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'BDQNYZH'
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
                reference: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078b22'
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
                reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-04-03T08:56:10.718Z',
        author: [],
        id: 'b7a1743e-1431-41ed-87a8-3606ec7f6671'
      }
    },
    {
      fullUrl: 'urn:uuid:791afdc5-2d8b-4e05-bd99-4aeea0b0480c',
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
          reference: 'urn:uuid:bcf4e631-ba4f-447b-b630-993709a38d71'
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'FATHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111111'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-04-03T08:56:12.031Z',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BDQNYZH'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'VALIDATED'
            }
          ]
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e74ed25d-8c9c-49aa-9abc-d2a659078b22',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'bn',
            given: ['রফিক'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Rafiq'],
            family: ['Islam']
          }
        ],
        gender: 'male',
        birthDate: '2010-01-01'
      }
    },
    {
      fullUrl: 'urn:uuid:dcca6eb2-b608-4bb3-b17e-31ae9caa74dc',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12341234123412341',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['বেগম'],
            family: ['রোকেয়া']
          },
          {
            use: 'en',
            given: ['Begum'],
            family: ['Rokeya']
          }
        ],
        birthDate: '1980-01-01',
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
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '2008-01-01'
          },
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
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'PRIMARY_ISCED_1'
          }
        ],
        multipleBirthInteger: 1,
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:63e5ea6d-6dc7-4df7-b908-328872e770e3',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '17238230233223321',
            type: 'BIRTH_REGISTRATION_NUMBER'
          }
        ],
        name: [
          {
            use: 'bn',
            given: ['ফারুক'],
            family: ['ইসলাম']
          },
          {
            use: 'en',
            given: ['Faruq'],
            family: ['Islam']
          }
        ],
        birthDate: '1970-01-01',
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
            url: 'http://opencrvs.org/specs/extension/date-of-marriage',
            valueDateTime: '2008-01-01'
          },
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
          },
          {
            url: 'http://opencrvs.org/specs/extension/educational-attainment',
            valueString: 'LOWER_SECONDARY_ISCED_2'
          }
        ],
        address: [
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          },
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '265abf9c-09d4-4b34-a0c6-336a53e23e4a'],
            district: 'a5010297-2d10-4109-8cb3-353ff9c084c2',
            state: '2414fc3f-7670-4d22-a053-5694858d72a2',
            country: 'BGD'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:3e199a21-3f71-41eb-b8ba-215e547d0d05'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:3e199a21-3f71-41eb-b8ba-215e547d0d05',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HOSPITAL'
            }
          ]
        },
        address: {
          line: ['', '', '', '', '', ''],
          district: '',
          state: '',
          postalCode: '',
          country: ''
        }
      }
    },
    {
      fullUrl: 'urn:uuid:e7249ecd-fb11-42cd-aa3b-d48e2288f504',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
        valueQuantity: {
          value: 'SINGLE'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:3a7eb860-2bdd-4a44-846b-74d6ce8a65cb',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
          value: 2,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:372abcdc-7b1d-4671-92dc-4a0353916cbe',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
        valueString: 'PHYSICIAN'
      }
    },
    {
      fullUrl: 'urn:uuid:99315e6d-bcb6-4e9a-ba85-a41cff4f3b08',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:ca8f8989-1a26-4494-a4d3-a777a620b1df'
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
              code: 'present-at-birth-reg',
              display: 'Present at birth registration'
            }
          ]
        },
        valueString: 'BOTH_PARENTS'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-04-03T08:56:10.718Z'
  }
}

export const mockMinimalDeathFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        id: 'ff6a4fce-4e72-463c-a6aa-718054643983',
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'DH86EY1'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'death-declaration'
            }
          ],
          text: 'Death Declaration'
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
        title: 'Death Declaration',
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
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
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
              {
                reference: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea'
              }
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
              {
                reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-19T13:05:13.524Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
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
    },
    {
      fullUrl: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea',
      resource: {
        resourceType: 'RelatedPerson',
        relationship: {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'EXTENDED_FAMILY'
            }
          ]
        },
        patient: {
          reference: 'urn:uuid:16d007fa-e516-4f71-8c4e-671c39274d1d'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:16d007fa-e516-4f71-8c4e-671c39274d1d',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '123123123',
            type: 'PASSPORT'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '01711111115'
          }
        ],
        address: [
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
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
    },
    {
      fullUrl: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/ee72f497-343f-4f0f-9062-d618fafc175c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:3cf94b36-1bba-4914-89ed-1e57230aba47',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
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
      fullUrl: 'urn:uuid:cd9330bb-f406-464b-9508-253c727feb31',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'DEATH'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DH86EY1'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-03-19T13:05:19.260Z'
      }
    }
  ],
  meta: {
    lastUpdated: '2019-03-19T13:05:13.524Z'
  }
}

export const mockMinimalMarriageFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  meta: {
    lastUpdated: '2019-03-19T13:05:13.524Z'
  },
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        id: 'ff6a4fce-4e72-463c-a6aa-718054643983',
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'DH86EY1'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'marriage-declaration'
            }
          ],
          text: 'Marriage Declaration'
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
        title: 'Marriage Declaration',
        section: [
          {
            title: 'Bride details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'bride-details'
                }
              ],
              text: 'Bride details'
            },
            entry: [
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
            ]
          },
          {
            title: 'Groom details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'groom-details'
                }
              ],
              text: 'Groom details'
            },
            entry: [
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
            ]
          },
          {
            title: 'Marriage encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'marriage-encounter'
                }
              ],
              text: 'Marriage encounter'
            },
            entry: [
              {
                reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-19T13:05:13.524Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'bn',
            family: ['এলাস্তিচ']
          },
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
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
    },
    {
      fullUrl: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/ee72f497-343f-4f0f-9062-d618fafc175c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:cd9330bb-f406-464b-9508-253c727feb31',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'MARRIAGE'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/marriage-tracking-id',
            value: 'DH86EY1'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-03-19T13:05:19.260Z'
      }
    }
  ]
}

export const dummyUser = {
  _id: '5d027bc403b93b17526323f6',
  name: [
    {
      use: 'en',
      given: ['Sakib Al'],
      family: 'Hasan'
    }
  ],
  username: 'sakibal.hasan',
  mobile: '+8801711111111',
  email: 'test@test.org',
  identifiers: [],
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345',
  scope: ['register'],
  systemRole: 'FIELD_AGENT',
  role: {
    _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
    labels: [
      {
        lang: 'en',
        label: 'Field Agent'
      }
    ]
  },
  status: 'active',
  avatar: {
    type: 'image/jpg',
    data: 'data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
  },
  practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ],
  securityQuestionAnswers: [
    {
      questionKey: 'BIRTH_TOWN',
      answerHash: '$2a$10$uHhZhgHqgOdt7CZdkKCysO/sVyYHwbEhB5q5TPE.fN9O1kiz0OxVG'
    },
    {
      questionKey: 'MOTHER_NICK_NAME',
      answerHash: '$2a$10$uHhZhgHqgOdt7CZdkKCysO/sVyYHwbEhB5q5TPE.fN9O1kiz0OxVG'
    },
    {
      questionKey: 'FAVORITE_MOVIE',
      answerHash: '$2a$10$uHhZhgHqgOdt7CZdkKCysO/sVyYHwbEhB5q5TPE.fN9O1kiz0OxVG'
    }
  ],
  creationDate: 1559054406433,
  auditHistory: []
}

export const mockUserModelResponse = {
  catchmentAreaIds: [
    'c93cb3cf-38aa-4f07-b9a0-fe8b865a9fd9',
    'd5ccd1d1-ca47-435b-93db-36c626ad2dfa',
    '94429795-0a09-4de8-8e1e-27dab01877d2',
    '1490d3dd-71a9-47e8-b143-f9fc64f71294',
    '1490d3dd-71a9-47e8-b143-f9fc64f71294'
  ],
  scope: ['register', 'performance', 'certify', 'demo'],
  status: 'active',
  _id: '5ddfdfec61f7c0d1aafe1961',
  name: [
    {
      given: ['Mohammad'],
      use: 'en',
      family: 'Ashraful'
    }
  ],
  username: 'mohammad.ashraful',
  email: 'test@test.org',
  mobile: '+8801733333333',
  passwordHash: 'hash',
  salt: '78e7e7a1-9e21-42d7-b535-ca3d982fcbaf',
  systemRole: 'LOCAL_REGISTRAR',
  role: {
    _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
    labels: [
      {
        lang: 'en',
        label: 'CHAIRMAN'
      }
    ]
  },
  practitionerId: '7f65e00c-88fc-4dd0-a7af-5ea42960ae61',
  primaryOfficeId: '45e37658-cec7-4c61-b999-c49cfaf16da5',
  securityQuestionAnswers: [],
  identifiers: [],
  creationDate: 1574952940762
}

export const mockEncounterResponse = {
  resourceType: 'Encounter',
  status: 'finished',
  id: 'd3b9f408-a16a-42c2-9cfe-53ad2fbfda99',
  location: [
    { location: { reference: 'Location/43f49a50-d8f4-4f30-ba84-6bc7bc181b67' } }
  ],
  meta: {
    lastUpdated: '2020-03-09T10:20:36.532+00:00',
    versionId: 'e927451f-e19f-40dd-be7b-5b6c50c26d9d'
  }
}

export const mockLocationResponse = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/internal-id',
      value: 'CRVS_FACILITY000002302'
    }
  ],
  name: 'Alokbali Union Parishad',
  alias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/c93cb3cf-38aa-4f07-b9a0-fe8b865a9fd9'
  },
  extension: [
    {
      url: 'http://opencrvs.org/extension/parent-location-reference',
      valueString: 'Location/c93cb3cf-38aa-4f07-b9a0-fe8b865a9fd9'
    }
  ],
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
  address: {
    line: ['Alokbali', 'Narsingdi '],
    district: 'Narsingdi',
    state: 'Dhaka'
  },
  meta: {
    lastUpdated: '2019-11-28T14:54:11.918+00:00',
    versionId: '8de2fb91-0ba2-4179-841c-6867dc29abe2'
  },
  id: '45e37658-cec7-4c61-b999-c49cfaf16da5'
}

export const mockFacilityResponse = {
  resourceType: 'Location',
  name: 'Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar',
  alias: ['Charmadhabpur(bakharnagar) Cc - Narsingdi Sadar'],
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/240e4216-5c32-41d3-b8a8-025e8c8260cb'
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
  telecom: [],
  address: {
    line: ['Alokbali', 'Narsingdi Sadar'],
    district: 'Narsingdi',
    state: 'Dhaka'
  },
  meta: {
    lastUpdated: '2019-12-19T16:45:00.661+00:00',
    versionId: '25b82e56-003f-4da7-975a-e9395100e819'
  },
  id: 'f1ea7c2f-0b71-43e8-a199-a92a0e17102c'
}

export const mockTaskBirthCorrectionBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/e849ceb4-0adc-4be2-8fc8-8a4c41781bb5',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        intent: '',
        input: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueCode: 'child',
            valueId: 'name',
            valueString: 'Old name'
          }
        ],
        output: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/action-type',
                  code: 'update'
                }
              ]
            },
            valueCode: 'child',
            valueId: 'name',
            valueString: 'New name'
          }
        ],
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        id: 'e849ceb4-0adc-4be2-8fc8-8a4c41781bb5'
      }
    }
  ]
}

export const mockTaskBundleWithExtensions = {
  resourceType: 'Bundle',
  id: 'dc4e9b8b-82fa-4868-a6d2-2fb49f795ec1',
  meta: { lastUpdated: '2018-11-29T10:43:30.286+00:00' },
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Task?focus=Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc',
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
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: { reference: 'DUMMY' }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regAssigned',
            valueReference: {
              reference: 'Practitioner/2d11389d-f58e-4d47-a562-b934f1b85936'
            }
          }
        ],
        lastModified: '2018-11-28T15:13:57.492Z',
        note: [
          {
            text: '',
            time: '2018-11-28T15:13:57.492Z',
            authorString: 'DUMMY'
          }
        ],
        focus: {
          reference: 'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B1mW7jA'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        meta: {
          lastUpdated: '2018-11-29T10:40:08.913+00:00',
          versionId: 'aa8c1c4a-4680-497f-81f7-fde357fdb77d'
        },
        id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc'
      }
    }
  ]
}

export const mockMarriageFhirBundle = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        id: 'ff6a4fce-4e72-463c-a6aa-718054643983',
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'DH86EY1'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'marriage-declaration'
            }
          ],
          text: 'Marriage Declaration'
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
        title: 'Marriage Declaration',
        section: [
          {
            title: 'Bride details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'bride-details'
                }
              ],
              text: 'Bride details'
            },
            entry: [
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
            ]
          },
          {
            title: 'Groom details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'groom-details'
                }
              ],
              text: 'Groom details'
            },
            entry: [
              {
                reference: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'WitnessOne details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'witness-one-details'
                }
              ],
              text: 'WitnessOne details'
            },
            entry: [
              {
                reference: 'urn:uuid:d9rc4e44-987a-4313-89b1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'WitnessTwo details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'witness-two-details'
                }
              ],
              text: 'WitnessTwo details'
            },
            entry: [
              {
                reference: 'urn:uuid:d9rc4e49-983a-4313-89c1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'Marriage encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'marriage-encounter'
                }
              ],
              text: 'Marriage encounter'
            },
            entry: [
              {
                reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-19T13:05:13.524Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
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
    },
    {
      fullUrl: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
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
    },
    {
      fullUrl: 'urn:uuid:d9rc4e44-987a-4313-89b1-0a71780c6bea',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            given: ['Habiba'],
            family: ['Akter']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:d9rc4e49-983a-4313-89c1-0a71780c6bea',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            given: ['Farabi'],
            family: ['Akter']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/ee72f497-343f-4f0f-9062-d618fafc175c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:cd9330bb-f406-464b-9508-253c727feb31',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'MARRIAGE'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DH86EY1'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'EXTENDED_FAMILY'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111114'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-03-19T13:05:19.260Z'
      }
    }
  ]
}

export const mockMarriageFhirBundleWithoutCompositionId = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1',
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'DH86EY1'
        },
        resourceType: 'Composition',
        status: 'preliminary',
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-types',
              code: 'marriage-declaration'
            }
          ],
          text: 'Marriage Declaration'
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
        title: 'Marriage Declaration',
        section: [
          {
            title: 'Bride details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'bride-details'
                }
              ],
              text: 'Bride details'
            },
            entry: [
              {
                reference: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd'
              }
            ]
          },
          {
            title: 'Groom details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'groom-details'
                }
              ],
              text: 'Groom details'
            },
            entry: [
              {
                reference: 'urn:uuid:d9dc4e44-987a-4313-89b1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'WitnessOne details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'witness-one-details'
                }
              ],
              text: 'WitnessOne details'
            },
            entry: [
              {
                reference: 'urn:uuid:d9rc4e44-987a-4313-89b1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'WitnessTwo details',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-sections',
                  code: 'witness-two-details'
                }
              ],
              text: 'WitnessTwo details'
            },
            entry: [
              {
                reference: 'urn:uuid:d9rc4e49-983a-4313-89c1-0a71780c6bea'
              }
            ]
          },
          {
            title: 'Marriage encounter',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/sections',
                  code: 'marriage-encounter'
                }
              ],
              text: 'Marriage encounter'
            },
            entry: [
              {
                reference: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df'
              }
            ]
          }
        ],
        subject: {},
        date: '2019-03-19T13:05:13.524Z',
        author: []
      }
    },
    {
      fullUrl: 'urn:uuid:6167c7ac-ddde-4c84-ae9f-af3850b9f2bd',
      resource: {
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '1234567890123',
            type: 'NATIONAL_ID'
          }
        ],
        name: [
          {
            use: 'en',
            family: ['elastic']
          }
        ],
        gender: 'male',
        birthDate: '1940-01-01',
        maritalStatus: {
          coding: [
            {
              system: 'http://hl7.org/fhir/StructureDefinition/marital-status',
              code: 'M'
            }
          ],
          text: 'MARRIED'
        },
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          },
          {
            type: 'SECONDARY_ADDRESS',
            line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
            district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
            state: '9a236522-0c3d-40eb-83ad-e8567518c763',
            country: 'BGD'
          }
        ],
        deceasedBoolean: true,
        deceasedDateTime: '2019-02-01',
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
    },
    {
      fullUrl: 'urn:uuid:d9rc4e44-987a-4313-89b1-0a71780c6bea',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            given: ['Habiba'],
            family: ['Akter']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:d9rc4e49-983a-4313-89c1-0a71780c6bea',
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'en',
            given: ['Farabi'],
            family: ['Akter']
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:db0f9b0b-1cc8-48bb-b4fc-23584937d5df',
      resource: {
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9'
            }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b11350af-826d-4573-a256-6ecede0d8fd9',
      resource: {
        resourceType: 'Location',
        mode: 'instance',
        partOf: {
          reference: 'Location/ee72f497-343f-4f0f-9062-d618fafc175c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'PRIMARY_ADDRESS'
            }
          ]
        },
        address: {
          type: 'PRIMARY_ADDRESS',
          line: ['', '', '', '', '', 'ee72f497-343f-4f0f-9062-d618fafc175c'],
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          country: 'BGD'
        }
      }
    },
    {
      fullUrl: 'urn:uuid:cd9330bb-f406-464b-9508-253c727feb31',
      resource: {
        resourceType: 'Task',
        status: 'ready',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'MARRIAGE'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:a2e730c8-07c8-4943-b66b-4ef9e4bde7a1'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/death-tracking-id',
            value: 'DH86EY1'
          }
        ],
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'EXTENDED_FAMILY'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '01711111114'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/cabb1751-2f1f-48a4-8ff5-31e7b1d79005'
            }
          },
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
          }
        ],
        lastModified: '2019-03-19T13:05:19.260Z'
      }
    }
  ]
}
