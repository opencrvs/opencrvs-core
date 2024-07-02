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
  SavedBundle,
  Task,
  TrackingID,
  URLReference
} from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'
import { cloneDeep } from 'lodash'

export const ARCHIVED_BIRTH_RECORD: SavedBundle<
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
    ...cloneDeep(READY_FOR_REVIEW_BIRTH_RECORD.entry).filter(
      (e) => e.resource.resourceType !== 'Task'
    ),
    {
      fullUrl:
        '/fhir/TaskHistory/8effdbd7-417b-4b6f-a78e-05a5a11d4d87/_history/8effdbd7-417b-4b6f-a78e-05a5a11d4d87' as URLReference,
      resource: {
        resourceType: 'TaskHistory' as 'Task', // TaskHistory doesn't work with BundleEntry
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'FATHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'nileeeem36@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 83530
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/4bf67dc1-8412-4276-bbd0-05409e9bba1e'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/7d9f973f-f606-42f8-a92e-58953f0576ba'
            }
          }
        ],
        status: 'ready',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '5a8b49c6-f61d-4891-a237-ffcd0ef4f08e'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B48K21W' as TrackingID
          }
        ],
        lastModified: '2023-12-21T13:03:48.641Z',
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
          reference: 'Composition/ef1bd844-a72b-42c3-b12b-13cb2a7c157c'
        },
        meta: {
          lastUpdated: '2023-12-21T13:04:28.938+00:00',
          versionId: '8effdbd7-417b-4b6f-a78e-05a5a11d4d87'
        },
        id: '8effdbd7-417b-4b6f-a78e-05a5a11d4d87' as UUID
      }
    },
    {
      fullUrl:
        '/fhir/Task/529a2252-597f-4651-9c53-fb0b68403247/_history/529a2252-597f-4651-9c53-fb0b68403247' as URLReference,
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
          reference: 'Composition/ef1bd844-a72b-42c3-b12b-13cb2a7c157c'
        },
        id: '529a2252-597f-4651-9c53-fb0b68403247' as UUID,
        requester: {
          agent: {
            reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
          }
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '5a8b49c6-f61d-4891-a237-ffcd0ef4f08e'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B48K21W' as TrackingID
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-email',
            valueString: 'nileeeem36@gmail.com'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/4bf67dc1-8412-4276-bbd0-05409e9bba1e'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueString: 'Ibombo District Office',
            valueReference: {
              reference: 'Location/7d9f973f-f606-42f8-a92e-58953f0576ba'
            }
          }
        ],
        reason: {
          text: ''
        },
        statusReason: {
          text: ''
        },
        lastModified: '2024-01-01T08:05:31.725Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'ARCHIVED'
            }
          ]
        },
        meta: {
          lastUpdated: '2024-01-01T08:05:31.743+00:00',
          versionId: '529a2252-597f-4651-9c53-fb0b68403247'
        }
      }
    }
  ]
}
