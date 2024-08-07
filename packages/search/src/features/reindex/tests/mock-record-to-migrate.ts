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

const recordToMigrate = {
  entry: [
    {
      fullUrl:
        '/fhir/Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b/_history/1cc4eb09-133e-4c9e-a8e6-1ca4b5bc787b',
      resource: {
        _id: '664a09c967676d001dea72e0',
        identifier: { system: 'urn:ietf:rfc:3986', value: 'B7JXEBP' },
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
                reference: 'RelatedPerson/cbbb0ac6-c1d2-4dc9-8c64-f0a5ac9780f4'
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
              { reference: 'Patient/ef9e46fe-448f-4903-83f3-8aff8ab2d204' }
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
              { reference: 'Patient/dedab1e7-9f77-4430-962d-1d458f10c645' }
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
              { reference: 'Patient/84c0fb60-dafe-49d6-abc7-3f83e52780c8' }
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
              { reference: 'Encounter/a635a245-6369-4286-9f21-c86445904ca1' }
            ]
          }
        ],
        subject: {},
        date: '2024-05-19T14:16:41.158Z',
        author: [],
        meta: {
          lastUpdated: '2024-05-19T14:16:41.444+00:00',
          versionId: '1cc4eb09-133e-4c9e-a8e6-1ca4b5bc787b'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.444Z' }
        },
        _request: { method: 'POST' },
        id: '2628a742-904e-4e99-b51d-fc9ba38f5a1b'
      }
    },
    {
      fullUrl:
        '/fhir/Encounter/a635a245-6369-4286-9f21-c86445904ca1/_history/610795d9-420a-4a84-bf60-49cd0342d4e5',
      resource: {
        _id: '664a09c967676d001dea72e9',
        resourceType: 'Encounter',
        status: 'finished',
        location: [
          {
            location: {
              reference: 'Location/3378df5e-a8f4-4504-9eca-21d573d76b09'
            }
          }
        ],
        meta: {
          lastUpdated: '2024-05-19T14:16:41.464+00:00',
          versionId: '610795d9-420a-4a84-bf60-49cd0342d4e5'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.464Z' }
        },
        _request: { method: 'POST' },
        id: 'a635a245-6369-4286-9f21-c86445904ca1'
      }
    },
    {
      fullUrl:
        '/fhir/RelatedPerson/cbbb0ac6-c1d2-4dc9-8c64-f0a5ac9780f4/_history/c59501fd-1407-4046-9519-e6fc7d803c0d',
      resource: {
        _id: '664a09c967676d001dea72e2',
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
          reference: 'Patient/ef9e46fe-448f-4903-83f3-8aff8ab2d204'
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.452+00:00',
          versionId: 'c59501fd-1407-4046-9519-e6fc7d803c0d'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.452Z' }
        },
        _request: { method: 'POST' },
        id: 'cbbb0ac6-c1d2-4dc9-8c64-f0a5ac9780f4'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/84c0fb60-dafe-49d6-abc7-3f83e52780c8/_history/d51fba1d-c406-4c73-aa94-685f96ecf8ef',
      resource: {
        _id: '664a09c967676d001dea72e7',
        resourceType: 'Patient',
        active: false,
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/reason-not-applying',
            valueString: 'He just vanished'
          }
        ],
        meta: {
          lastUpdated: '2024-05-19T14:16:41.463+00:00',
          versionId: 'd51fba1d-c406-4c73-aa94-685f96ecf8ef'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.463Z' }
        },
        _request: { method: 'POST' },
        id: '84c0fb60-dafe-49d6-abc7-3f83e52780c8'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/dedab1e7-9f77-4430-962d-1d458f10c645/_history/118df627-7754-4641-bcb5-c9f2f22ce31f',
      resource: {
        _id: '664a09c967676d001dea72e5',
        resourceType: 'Patient',
        active: true,
        name: [{ use: 'en', given: ['qw', ''], family: ['qw'] }],
        gender: 'male',
        birthDate: '2024-03-21',
        meta: {
          lastUpdated: '2024-05-19T14:16:42.191+00:00',
          versionId: '118df627-7754-4641-bcb5-c9f2f22ce31f'
        },
        id: 'dedab1e7-9f77-4430-962d-1d458f10c645',
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
            value: '2024B7JXEBP'
          },
          {
            type: {
              coding: [{ code: 'BIRTH_CONFIGURABLE_IDENTIFIER_1' }]
            },
            value: ''
          },
          {
            type: {
              coding: [{ code: 'BIRTH_CONFIGURABLE_IDENTIFIER_2' }]
            },
            value: ''
          },
          {
            type: {
              coding: [{ code: 'BIRTH_CONFIGURABLE_IDENTIFIER_3' }]
            },
            value: ''
          }
        ],
        _transforms: {
          matching: {
            name: {
              given: [
                ['K', 'K'],
                ['', '']
              ],
              family: [['K', 'K']]
            }
          },
          meta: { lastUpdated: '2024-05-19T14:16:42.191Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/ef9e46fe-448f-4903-83f3-8aff8ab2d204/_history/c6d389fa-11a3-4a68-89ee-b1ea87a76e34',
      resource: {
        _id: '664a09c967676d001dea72e3',
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12311231231',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_REGISTRATION_NUMBER'
                }
              ]
            }
          }
        ],
        name: [{ use: 'en', given: ['mama', ''], family: ['cita'] }],
        birthDate: '1990-04-23',
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            district: 'eb1763fc-bb09-4057-8048-3ca4f1da7c3f',
            state: 'e1f3d928-bffa-4c4e-8403-f549d7e7a3fc',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
                }
              }
            ]
          }
        ],
        extension: [
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
          }
        ],
        _transforms: {
          matching: {
            name: {
              given: [
                ['MM', 'MM'],
                ['', '']
              ],
              family: [['ST', 'ST']]
            }
          },
          meta: { lastUpdated: '2024-05-19T14:16:41.455Z' }
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.455+00:00',
          versionId: 'c6d389fa-11a3-4a68-89ee-b1ea87a76e34'
        },
        _request: { method: 'POST' },
        id: 'ef9e46fe-448f-4903-83f3-8aff8ab2d204'
      }
    },
    {
      fullUrl:
        '/fhir/Task/298b44d2-d173-4b73-bcac-301a9a939e87/_history/2814ec1d-c73c-4325-9020-f7586ae4524c',
      resource: {
        _id: '664a09c967676d001dea72e1',
        resourceType: 'Task',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: '298b44d2-d173-4b73-bcac-301a9a939e87',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T14:40:20.960Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T14:40:21.013+00:00',
          versionId: '2814ec1d-c73c-4325-9020-f7586ae4524c'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T14:40:21.013Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/7e338b7e-b360-4080-8b66-be8136dab1a2/_history/7e338b7e-b360-4080-8b66-be8136dab1a2',
      resource: {
        _id: '664a09ca67676d001dea72ee',
        resourceType: 'TaskHistory',
        status: 'requested',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 573901
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'HQ Office',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-05-19T14:16:41.158Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'WAITING_VALIDATION'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.449+00:00',
          versionId: '7e338b7e-b360-4080-8b66-be8136dab1a2'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.449Z' }
        },
        _request: { method: 'POST' },
        id: '7e338b7e-b360-4080-8b66-be8136dab1a2'
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/491bb29b-862f-4312-9275-4ceb98336291/_history/491bb29b-862f-4312-9275-4ceb98336291',
      resource: {
        _id: '6682a192a5624d001d746dcd',
        resourceType: 'TaskHistory',
        status: 'ready',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 573901
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'HQ Office',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-05-19T14:16:41.158Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:42.176+00:00',
          versionId: '491bb29b-862f-4312-9275-4ceb98336291'
        },
        id: '491bb29b-862f-4312-9275-4ceb98336291',
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:42.176Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/e90490f2-354e-4e35-9c8b-294fe41f71ba/_history/e90490f2-354e-4e35-9c8b-294fe41f71ba',
      resource: {
        _id: '6682a21ea5624d001d746dce',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: 'e90490f2-354e-4e35-9c8b-294fe41f71ba',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:31:14.537Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:31:14.609+00:00',
          versionId: 'e90490f2-354e-4e35-9c8b-294fe41f71ba'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:31:14.609Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/a74391b2-8eae-41c0-9ae0-a3e56d233d69/_history/a74391b2-8eae-41c0-9ae0-a3e56d233d69',
      resource: {
        _id: '6682a276a5624d001d746dcf',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: 'a74391b2-8eae-41c0-9ae0-a3e56d233d69',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:33:34.691Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:33:34.727+00:00',
          versionId: 'a74391b2-8eae-41c0-9ae0-a3e56d233d69'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:33:34.727Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/2d84e531-71ee-41e6-902d-3baa18acc23e/_history/2d84e531-71ee-41e6-902d-3baa18acc23e',
      resource: {
        _id: '6682a450a5624d001d746dd0',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: '2d84e531-71ee-41e6-902d-3baa18acc23e',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:35:02.681Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:35:02.740+00:00',
          versionId: '2d84e531-71ee-41e6-902d-3baa18acc23e'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:35:02.740Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/a4ed7a97-8845-4985-b526-886b73aa7f8b/_history/a4ed7a97-8845-4985-b526-886b73aa7f8b',
      resource: {
        _id: '6682a59ea5624d001d746dd1',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: 'a4ed7a97-8845-4985-b526-886b73aa7f8b',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:42:56.852Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:42:56.893+00:00',
          versionId: 'a4ed7a97-8845-4985-b526-886b73aa7f8b'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:42:56.893Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/3b545c8c-4ec1-4c9f-ad03-2f0e73c16efa/_history/3b545c8c-4ec1-4c9f-ad03-2f0e73c16efa',
      resource: {
        _id: '6682a5a7a5624d001d746dd2',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: '3b545c8c-4ec1-4c9f-ad03-2f0e73c16efa',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:48:30.846Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:48:30.877+00:00',
          versionId: '3b545c8c-4ec1-4c9f-ad03-2f0e73c16efa'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:48:30.877Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/cba6f8d1-a167-4ace-80a1-763a5b65d3a8/_history/cba6f8d1-a167-4ace-80a1-763a5b65d3a8',
      resource: {
        _id: '6682a5aba5624d001d746dd3',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: 'cba6f8d1-a167-4ace-80a1-763a5b65d3a8',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:48:39.807Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:48:39.856+00:00',
          versionId: 'cba6f8d1-a167-4ace-80a1-763a5b65d3a8'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:48:39.856Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/f8998136-ec50-44fa-9c9f-8ffaaa2d6ffc/_history/f8998136-ec50-44fa-9c9f-8ffaaa2d6ffc',
      resource: {
        _id: '6682a5c0a5624d001d746dd4',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: 'f8998136-ec50-44fa-9c9f-8ffaaa2d6ffc',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:48:43.534Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:48:43.567+00:00',
          versionId: 'f8998136-ec50-44fa-9c9f-8ffaaa2d6ffc'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:48:43.567Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/3019ba31-fc26-4e30-a449-1dba85bab2ce/_history/3019ba31-fc26-4e30-a449-1dba85bab2ce',
      resource: {
        _id: '6682a5c5a5624d001d746dd5',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: '3019ba31-fc26-4e30-a449-1dba85bab2ce',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:49:04.623Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:49:04.671+00:00',
          versionId: '3019ba31-fc26-4e30-a449-1dba85bab2ce'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:49:04.671Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/97ccfdee-1d1a-4b25-8484-a077a9314f71/_history/97ccfdee-1d1a-4b25-8484-a077a9314f71',
      resource: {
        _id: '6682a5d4a5624d001d746dd6',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: '97ccfdee-1d1a-4b25-8484-a077a9314f71',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:49:09.211Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:49:09.261+00:00',
          versionId: '97ccfdee-1d1a-4b25-8484-a077a9314f71'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:49:09.261Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/TaskHistory/a529dee7-707a-4fa7-bc88-3551f173c51a/_history/a529dee7-707a-4fa7-bc88-3551f173c51a',
      resource: {
        _id: '6682bfd5a5624d001d746dd7',
        resourceType: 'TaskHistory',
        status: 'ready',
        intent: 'proposal',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/2628a742-904e-4e99-b51d-fc9ba38f5a1b'
        },
        id: 'a529dee7-707a-4fa7-bc88-3551f173c51a',
        requester: {
          agent: {
            reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '2b58981a-d0e2-4083-b95e-ee0f2d393262'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B7JXEBP'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2024B7JXEBP'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'test@test.com'
          },
          { url: 'http://opencrvs.org/specs/extension/regViewed' },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
            }
          }
        ],
        lastModified: '2024-07-01T12:49:24.610Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-07-01T12:49:24.647+00:00',
          versionId: 'a529dee7-707a-4fa7-bc88-3551f173c51a'
        },
        _transforms: {
          meta: { lastUpdated: '2024-07-01T12:49:24.647Z' }
        },
        _request: { method: 'PUT' }
      }
    },
    {
      fullUrl:
        '/fhir/Patient/ef9e46fe-448f-4903-83f3-8aff8ab2d204/_history/c6d389fa-11a3-4a68-89ee-b1ea87a76e34',
      resource: {
        _id: '664a09c967676d001dea72e3',
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12311231231',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_REGISTRATION_NUMBER'
                }
              ]
            }
          }
        ],
        name: [{ use: 'en', given: ['mama', ''], family: ['cita'] }],
        birthDate: '1990-04-23',
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            district: 'eb1763fc-bb09-4057-8048-3ca4f1da7c3f',
            state: 'e1f3d928-bffa-4c4e-8403-f549d7e7a3fc',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
                }
              }
            ]
          }
        ],
        extension: [
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
          }
        ],
        _transforms: {
          matching: {
            name: {
              given: [
                ['MM', 'MM'],
                ['', '']
              ],
              family: [['ST', 'ST']]
            }
          },
          meta: { lastUpdated: '2024-05-19T14:16:41.455Z' }
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.455+00:00',
          versionId: 'c6d389fa-11a3-4a68-89ee-b1ea87a76e34'
        },
        _request: { method: 'POST' },
        id: 'ef9e46fe-448f-4903-83f3-8aff8ab2d204'
      }
    },
    {
      fullUrl:
        '/fhir/Observation/73c8a8a2-adab-42ca-87f9-469551e213f6/_history/520a2723-a323-41d1-b268-790fced20abf',
      resource: {
        _id: '664a09c967676d001dea72ea',
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/a635a245-6369-4286-9f21-c86445904ca1'
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
        valueQuantity: { value: 'HIGHER_MULTIPLE_DELIVERY' },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.467+00:00',
          versionId: '520a2723-a323-41d1-b268-790fced20abf'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.467Z' }
        },
        _request: { method: 'POST' },
        id: '73c8a8a2-adab-42ca-87f9-469551e213f6'
      }
    },
    {
      fullUrl:
        '/fhir/Observation/e8f94015-dab1-4ff3-a81c-b458784f414e/_history/82b77d62-785e-41ce-b2a0-87d455ac86ce',
      resource: {
        _id: '664a09c967676d001dea72ec',
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/a635a245-6369-4286-9f21-c86445904ca1'
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
          value: 4,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.476+00:00',
          versionId: '82b77d62-785e-41ce-b2a0-87d455ac86ce'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.476Z' }
        },
        _request: { method: 'POST' },
        id: 'e8f94015-dab1-4ff3-a81c-b458784f414e'
      }
    },
    {
      fullUrl:
        '/fhir/Observation/74c0e80c-5bbb-4835-94d3-92a77190eb53/_history/9f568ffe-9531-4bf5-a789-acf382c90675',
      resource: {
        _id: '664a09c967676d001dea72ed',
        resourceType: 'Observation',
        status: 'final',
        context: {
          reference: 'Encounter/a635a245-6369-4286-9f21-c86445904ca1'
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
          lastUpdated: '2024-05-19T14:16:41.477+00:00',
          versionId: '9f568ffe-9531-4bf5-a789-acf382c90675'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.477Z' }
        },
        _request: { method: 'POST' },
        id: '74c0e80c-5bbb-4835-94d3-92a77190eb53'
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88/_history/65a097c2-5e76-47a8-b140-44c082a75202',
      resource: {
        _id: '664a015a0f7c5e001d3619a6',
        resourceType: 'Practitioner',
        identifier: [],
        telecom: [
          { system: 'phone', value: '0915151515' },
          { system: 'email', value: 'kalush.abwalya17@gmail.com' }
        ],
        name: [{ use: 'en', family: 'Musonda', given: ['Joseph'] }],
        meta: {
          lastUpdated: '2024-05-19T13:40:42.226+00:00',
          versionId: '65a097c2-5e76-47a8-b140-44c082a75202'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:42.226Z' }
        },
        _request: { method: 'POST' },
        id: 'c87cade9-e542-4786-aa45-79a63f5d0e88'
      }
    },
    {
      fullUrl:
        '/fhir/Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5/_history/8b368f9d-6bdf-43f4-b10e-38902eaa9f84',
      resource: {
        _id: '664a01560f7c5e001d361970',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_2OKicPQMNI'
          }
        ],
        name: 'HQ Office',
        alias: ['HQ Office'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
        },
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
          lastUpdated: '2024-05-19T13:40:38.362+00:00',
          versionId: '8b368f9d-6bdf-43f4-b10e-38902eaa9f84'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:38.362Z' }
        },
        _request: { method: 'POST' },
        id: '89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
      }
    },
    {
      fullUrl:
        '/fhir/Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f/_history/abbf78f3-0fc8-473d-bc83-942c8ccab4ca',
      resource: {
        _id: '664a01550f7c5e001d3616fc',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_BxrIbNW7f3K'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Embe',
        alias: ['Embe'],
        description: 'BxrIbNW7f3K',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/e1f3d928-bffa-4c4e-8403-f549d7e7a3fc'
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
          coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
          lastUpdated: '2024-05-19T13:40:37.763+00:00',
          versionId: 'abbf78f3-0fc8-473d-bc83-942c8ccab4ca'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:37.763Z' }
        },
        _request: { method: 'POST' },
        id: 'eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
      }
    },
    {
      fullUrl:
        '/fhir/Location/3378df5e-a8f4-4504-9eca-21d573d76b09/_history/e5c9774d-2866-40f6-b9b1-c94b33433013',
      resource: {
        _id: '664a01560f7c5e001d361826',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_peVc3YE5reG'
          }
        ],
        name: 'Ellensdale Farm Health Post',
        alias: ['Ellensdale Farm Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/a1169533-5958-41ad-830e-bde2d20e57af'
        },
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
          lastUpdated: '2024-05-19T13:40:38.250+00:00',
          versionId: 'e5c9774d-2866-40f6-b9b1-c94b33433013'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:38.250Z' }
        },
        _request: { method: 'POST' },
        id: '3378df5e-a8f4-4504-9eca-21d573d76b09'
      }
    },
    {
      fullUrl:
        '/fhir/Location/3378df5e-a8f4-4504-9eca-21d573d76b09/_history/e5c9774d-2866-40f6-b9b1-c94b33433013',
      resource: {
        _id: '664a01560f7c5e001d361826',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_peVc3YE5reG'
          }
        ],
        name: 'Ellensdale Farm Health Post',
        alias: ['Ellensdale Farm Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/a1169533-5958-41ad-830e-bde2d20e57af'
        },
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
          lastUpdated: '2024-05-19T13:40:38.250+00:00',
          versionId: 'e5c9774d-2866-40f6-b9b1-c94b33433013'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:38.250Z' }
        },
        _request: { method: 'POST' },
        id: '3378df5e-a8f4-4504-9eca-21d573d76b09'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/ef9e46fe-448f-4903-83f3-8aff8ab2d204/_history/c6d389fa-11a3-4a68-89ee-b1ea87a76e34',
      resource: {
        _id: '664a09c967676d001dea72e3',
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12311231231',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_REGISTRATION_NUMBER'
                }
              ]
            }
          }
        ],
        name: [{ use: 'en', given: ['mama', ''], family: ['cita'] }],
        birthDate: '1990-04-23',
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            district: 'eb1763fc-bb09-4057-8048-3ca4f1da7c3f',
            state: 'e1f3d928-bffa-4c4e-8403-f549d7e7a3fc',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
                }
              }
            ]
          }
        ],
        extension: [
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
          }
        ],
        _transforms: {
          matching: {
            name: {
              given: [
                ['MM', 'MM'],
                ['', '']
              ],
              family: [['ST', 'ST']]
            }
          },
          meta: { lastUpdated: '2024-05-19T14:16:41.455Z' }
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.455+00:00',
          versionId: 'c6d389fa-11a3-4a68-89ee-b1ea87a76e34'
        },
        _request: { method: 'POST' },
        id: 'ef9e46fe-448f-4903-83f3-8aff8ab2d204'
      }
    },
    {
      fullUrl:
        '/fhir/Patient/ef9e46fe-448f-4903-83f3-8aff8ab2d204/_history/c6d389fa-11a3-4a68-89ee-b1ea87a76e34',
      resource: {
        _id: '664a09c967676d001dea72e3',
        resourceType: 'Patient',
        active: true,
        identifier: [
          {
            value: '12311231231',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/identifier-type',
                  code: 'BIRTH_REGISTRATION_NUMBER'
                }
              ]
            }
          }
        ],
        name: [{ use: 'en', given: ['mama', ''], family: ['cita'] }],
        birthDate: '1990-04-23',
        address: [
          {
            type: 'PRIMARY_ADDRESS',
            line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            district: 'eb1763fc-bb09-4057-8048-3ca4f1da7c3f',
            state: 'e1f3d928-bffa-4c4e-8403-f549d7e7a3fc',
            country: 'FAR',
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/part-of',
                valueReference: {
                  reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
                }
              }
            ]
          }
        ],
        extension: [
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
          }
        ],
        _transforms: {
          matching: {
            name: {
              given: [
                ['MM', 'MM'],
                ['', '']
              ],
              family: [['ST', 'ST']]
            }
          },
          meta: { lastUpdated: '2024-05-19T14:16:41.455Z' }
        },
        meta: {
          lastUpdated: '2024-05-19T14:16:41.455+00:00',
          versionId: 'c6d389fa-11a3-4a68-89ee-b1ea87a76e34'
        },
        _request: { method: 'POST' },
        id: 'ef9e46fe-448f-4903-83f3-8aff8ab2d204'
      }
    },
    {
      fullUrl:
        '/fhir/PractitionerRole/82375f44-6903-43b3-acff-d5d9d73199dd/_history/5722a179-8bce-4df0-8086-013c9a58961f',
      resource: {
        _id: '664a015a0f7c5e001d3619a7',
        resourceType: 'PractitionerRole',
        practitioner: {
          reference: 'Practitioner/c87cade9-e542-4786-aa45-79a63f5d0e88'
        },
        code: [
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/roles',
                code: 'NATIONAL_REGISTRAR'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://opencrvs.org/specs/types',
                code: '[{"lang":"en","label":"National Registrar"},{"lang":"fr","label":"Registraire national"}]'
              }
            ]
          }
        ],
        location: [
          { reference: 'Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5' }
        ],
        meta: {
          lastUpdated: '2024-05-19T13:40:42.328+00:00',
          versionId: '5722a179-8bce-4df0-8086-013c9a58961f'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:42.328Z' }
        },
        _request: { method: 'POST' },
        id: '82375f44-6903-43b3-acff-d5d9d73199dd'
      }
    },
    {
      fullUrl:
        '/fhir/QuestionnaireResponse/f65d9d16-f710-4bff-b3e9-5eabc5601a5c/_history/e4913139-587a-4fe3-9f19-be5c42a61055',
      resource: {
        _id: '664a09c967676d001dea72eb',
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        subject: {
          reference: 'Encounter/a635a245-6369-4286-9f21-c86445904ca1'
        },
        item: [
          {
            text: 'birth.mother.mother-view-group.motherIdType',
            linkId: '',
            answer: [{ valueString: 'BIRTH_REGISTRATION_NUMBER' }]
          }
        ],
        meta: {
          lastUpdated: '2024-05-19T14:16:41.470+00:00',
          versionId: 'e4913139-587a-4fe3-9f19-be5c42a61055'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T14:16:41.470Z' }
        },
        _request: { method: 'POST' },
        id: 'f65d9d16-f710-4bff-b3e9-5eabc5601a5c'
      }
    },
    {
      fullUrl:
        '/fhir/Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5/_history/8b368f9d-6bdf-43f4-b10e-38902eaa9f84',
      resource: {
        _id: '664a01560f7c5e001d361970',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_2OKicPQMNI'
          }
        ],
        name: 'HQ Office',
        alias: ['HQ Office'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
        },
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
          lastUpdated: '2024-05-19T13:40:38.362+00:00',
          versionId: '8b368f9d-6bdf-43f4-b10e-38902eaa9f84'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:38.362Z' }
        },
        _request: { method: 'POST' },
        id: '89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
      }
    },
    {
      fullUrl:
        '/fhir/Location/e1f3d928-bffa-4c4e-8403-f549d7e7a3fc/_history/0a1a26ea-62b9-4ac1-a1d6-e831dc6820c8',
      resource: {
        _id: '664a01550f7c5e001d3616f4',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_B1u1bVtIA92'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Pualula',
        alias: ['Pualula'],
        description: 'B1u1bVtIA92',
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/0' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
          lastUpdated: '2024-05-19T13:40:37.749+00:00',
          versionId: '0a1a26ea-62b9-4ac1-a1d6-e831dc6820c8'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:37.749Z' }
        },
        _request: { method: 'POST' },
        id: 'e1f3d928-bffa-4c4e-8403-f549d7e7a3fc'
      }
    },
    {
      fullUrl:
        '/fhir/Location/3378df5e-a8f4-4504-9eca-21d573d76b09/_history/e5c9774d-2866-40f6-b9b1-c94b33433013',
      resource: {
        _id: '664a01560f7c5e001d361826',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_peVc3YE5reG'
          }
        ],
        name: 'Ellensdale Farm Health Post',
        alias: ['Ellensdale Farm Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/a1169533-5958-41ad-830e-bde2d20e57af'
        },
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
          lastUpdated: '2024-05-19T13:40:38.250+00:00',
          versionId: 'e5c9774d-2866-40f6-b9b1-c94b33433013'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:38.250Z' }
        },
        _request: { method: 'POST' },
        id: '3378df5e-a8f4-4504-9eca-21d573d76b09'
      }
    },
    {
      fullUrl:
        '/fhir/Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f/_history/abbf78f3-0fc8-473d-bc83-942c8ccab4ca',
      resource: {
        _id: '664a01550f7c5e001d3616fc',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_BxrIbNW7f3K'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Embe',
        alias: ['Embe'],
        description: 'BxrIbNW7f3K',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/e1f3d928-bffa-4c4e-8403-f549d7e7a3fc'
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
          coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
          lastUpdated: '2024-05-19T13:40:37.763+00:00',
          versionId: 'abbf78f3-0fc8-473d-bc83-942c8ccab4ca'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:37.763Z' }
        },
        _request: { method: 'POST' },
        id: 'eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
      }
    },
    {
      fullUrl:
        '/fhir/Location/89b59b75-472e-4d40-ab1b-6d4d78ee49d5/_history/8b368f9d-6bdf-43f4-b10e-38902eaa9f84',
      resource: {
        _id: '664a01560f7c5e001d361970',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_2OKicPQMNI'
          }
        ],
        name: 'HQ Office',
        alias: ['HQ Office'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/eb1763fc-bb09-4057-8048-3ca4f1da7c3f'
        },
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
          lastUpdated: '2024-05-19T13:40:38.362+00:00',
          versionId: '8b368f9d-6bdf-43f4-b10e-38902eaa9f84'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:38.362Z' }
        },
        _request: { method: 'POST' },
        id: '89b59b75-472e-4d40-ab1b-6d4d78ee49d5'
      }
    },
    {
      fullUrl:
        '/fhir/Location/a1169533-5958-41ad-830e-bde2d20e57af/_history/360b4222-07bf-451a-98a3-937416e102a5',
      resource: {
        _id: '664a01550f7c5e001d361704',
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_NLjvK1QsrN3'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ienge',
        alias: ['Ienge'],
        description: 'NLjvK1QsrN3',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/e1f3d928-bffa-4c4e-8403-f549d7e7a3fc'
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
          coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
          lastUpdated: '2024-05-19T13:40:37.767+00:00',
          versionId: '360b4222-07bf-451a-98a3-937416e102a5'
        },
        _transforms: {
          meta: { lastUpdated: '2024-05-19T13:40:37.767Z' }
        },
        _request: { method: 'POST' },
        id: 'a1169533-5958-41ad-830e-bde2d20e57af'
      }
    }
  ]
}

export default recordToMigrate
