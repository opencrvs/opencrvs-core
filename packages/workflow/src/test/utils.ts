import { UUID } from '@opencrvs/commons'
import {
  Bundle,
  Composition,
  Patient,
  RelatedPerson,
  ResourceIdentifier,
  Saved,
  StrictBundle,
  Task,
  TrackingID,
  URLReference,
  URNReference
} from '@opencrvs/commons/types'

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

export const testFhirBundle: StrictBundle<
  [Composition, Task, Patient, Patient, Patient, RelatedPerson]
> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: `urn:uuid:888` as URNReference,
      resource: {
        identifier: {
          system: 'urn:ietf:rfc:3986',
          value: '0ab5e4cd-a49b-4bf3-b03a-08b2e65e642a'
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
        subject: {},
        date: '2018-05-23T14:44:58+02:00',
        author: [],
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
                reference:
                  'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662' as URNReference
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
                  'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57' as URNReference
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
                  'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221' as URNReference
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
                  'urn:uuid:b9044443-4977-4912-b0e7-4977b0e7' as URNReference
              }
            ]
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9' as URNReference,
      resource: {
        resourceType: 'Task',
        status: 'ready',
        intent: 'order',
        lastModified: '2018-11-29T15:11:13.041+00:00',
        encounter: { reference: 'Encounter/123' },
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'DECLARED'
            }
          ]
        },
        focus: {
          reference: 'urn:uuid:888' as URNReference
        },
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/paper-form-id',
            value: '12345678'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B5WGYJE' as TrackingID
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801622688231'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: { reference: 'Location/123' as `Location/${UUID}` }
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662' as URNReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            family: 'অনিক',
            given: ['অনিক'],
            use: 'bn'
          }
        ],
        gender: 'male'
      }
    },
    {
      fullUrl: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57' as URNReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            given: ['Jane'],
            family: 'Doe',
            use: 'bn'
          }
        ],
        gender: 'female',
        telecom: [
          {
            system: 'phone',
            value: '+8801622688231'
          }
        ]
      }
    },
    {
      fullUrl: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221' as URNReference,
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [
          {
            given: ['Jack'],
            family: 'Doe',
            use: 'en'
          }
        ],
        gender: 'male'
      }
    },
    {
      fullUrl: 'urn:uuid:b9044443-4977-4912-b0e7-4977b0e7' as URNReference,
      resource: {
        resourceType: 'RelatedPerson',
        active: true,
        patient: {
          reference:
            'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57' as URNReference
        }
      }
    }
  ]
}

export const testFhirTaskBundle: Saved<Bundle<Task>> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Task/ba0412c6-5125-4447-bd32-fb5cf336ddbc' as URLReference,
      resource: {
        resourceType: 'Task',
        status: 'ready',
        intent: 'order',
        lastModified: '2018-11-29T15:11:13.041+00:00',
        encounter: { reference: 'Encounter/123' },
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: { reference: 'DUMMY' as ResourceIdentifier }
          }
        ],
        note: [
          {
            text: 'reason=Misspelling&comment=CHild name was misspelled',
            time: '2018-11-28T15:13:57.492Z',
            authorString: ''
          }
        ],
        focus: {
          reference:
            'Composition/df3fb104-4c2c-486f-97b3-edbeabcd4422' as ResourceIdentifier
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B1mW7jA' as TrackingID
          }
        ],
        businessStatus: {
          coding: [
            { system: 'http://opencrvs.org/specs/reg-status', code: 'DECLARED' }
          ]
        },
        meta: {
          lastUpdated: '2018-11-29T15:11:13.041+00:00',
          versionId: 'f2efacc4-b00c-4ee9-a9f0-4a33870e64ae'
        },
        id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc' as UUID
      }
    }
  ]
}
