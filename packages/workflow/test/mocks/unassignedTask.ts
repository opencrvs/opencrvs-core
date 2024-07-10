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

import { READY_FOR_REVIEW_BIRTH_RECORD } from './records/readyForReview'

export const bundleWithAssignedTask = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    // mock composition
    READY_FOR_REVIEW_BIRTH_RECORD.entry[0],
    {
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
          reference: 'Composition/59881806-4787-44c5-9a9f-e7d1c3c258e1'
        },
        id: 'fa4d3333-a830-4196-81df-857e143ce598',
        requester: {
          agent: {
            reference: 'Practitioner/f20ad76d-87c3-46ab-8fbc-0d104a5b3e69'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '96ecae8d-4fa4-4238-9562-74e02db44b29'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'BZMOVDQ'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'nileeeem36@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regAssigned'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/f20ad76d-87c3-46ab-8fbc-0d104a5b3e69'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/8673967b-b884-432f-a4d3-5ab632884499'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/6a867503-23c1-4961-85b0-d0cb60e8d7d7'
            }
          }
        ],
        lastModified: '2023-12-19T06:38:53.213Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'VALIDATED'
            }
          ]
        },
        meta: {
          lastUpdated: '2023-12-19T06:38:53.213Z',
          versionId: '757f0e0e-2df4-4f8f-b4a4-065047bb35c0'
        }
      }
    },
    {
      fullUrl:
        '/fhir/Practitioner/f20ad76d-87c3-46ab-8fbc-0d104a5b3e69/_history/d98a5727-eb9b-41b8-9851-f9be7b8d0eec',
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
          lastUpdated: '2024-06-06T10:45:05.773+00:00',
          versionId: 'd98a5727-eb9b-41b8-9851-f9be7b8d0eec'
        },
        _transforms: {
          meta: {
            lastUpdated: '2024-06-06T10:45:05.773Z'
          }
        },
        _request: {
          method: 'POST'
        },
        id: 'f20ad76d-87c3-46ab-8fbc-0d104a5b3e69'
      }
    }
  ]
}
