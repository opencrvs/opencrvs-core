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

import { createServer } from '@workflow/server'
import { readFileSync } from 'fs'
import { server as mswServer } from '@test/setupServer'
import { rest } from 'msw'
import * as jwt from 'jsonwebtoken'
import {
  ReadyForReviewRecord,
  RegisteredRecord,
  SavedBundle
} from '@opencrvs/commons/types'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'
import { cloneDeep } from 'lodash'
import { mockTaskHistoryEntries } from '@test/mocks/records/reinstate'

function getRegStatus(record: ReadyForReviewRecord | RegisteredRecord) {
  const taskEntry = record.entry.find((e) => e.resource.resourceType === 'Task')
  //@ts-ignore
  return taskEntry?.resource.businessStatus.coding[0].code
}

// const mockTaskHistoryEntries: SavedBundleEntry<Resource>[] = [
//   {
//     fullUrl:
//       '/fhir/TaskHistory/8effdbd7-417b-4b6f-a78e-05a5a11d4d87/_history/8effdbd7-417b-4b6f-a78e-05a5a11d4d87' as URLReference,
//     resource: {
//       resourceType: 'TaskHistory',
//       extension: [
//         {
//           url: 'http://opencrvs.org/specs/extension/contact-person',
//           valueString: 'FATHER'
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/contact-person-email',
//           valueString: 'nileeeem36@gmail.com'
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
//           valueInteger: 83530
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastUser',
//           valueReference: {
//             reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
//           }
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastLocation',
//           valueReference: {
//             reference: 'Location/4bf67dc1-8412-4276-bbd0-05409e9bba1e'
//           }
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastOffice',
//           valueString: 'Ibombo District Office',
//           valueReference: {
//             reference: 'Location/7d9f973f-f606-42f8-a92e-58953f0576ba'
//           }
//         }
//       ],
//       status: 'ready',
//       identifier: [
//         {
//           system: 'http://opencrvs.org/specs/id/draft-id',
//           value: '5a8b49c6-f61d-4891-a237-ffcd0ef4f08e'
//         },
//         {
//           system: 'http://opencrvs.org/specs/id/birth-tracking-id',
//           value: 'B48K21W'
//         }
//       ],
//       lastModified: '2023-12-21T13:03:48.641Z',
//       businessStatus: {
//         coding: [
//           {
//             system: 'http://opencrvs.org/specs/reg-status',
//             code: 'DECLARED'
//           }
//         ]
//       },
//       code: {
//         coding: [
//           {
//             system: 'http://opencrvs.org/specs/types',
//             code: 'BIRTH'
//           }
//         ]
//       },
//       focus: {
//         reference: 'Composition/ef1bd844-a72b-42c3-b12b-13cb2a7c157c'
//       },
//       meta: {
//         lastUpdated: '2023-12-21T13:04:28.938+00:00',
//         versionId: '8effdbd7-417b-4b6f-a78e-05a5a11d4d87'
//       },
//       _transforms: {
//         meta: {
//           lastUpdated: '2023-12-21T13:04:28.938Z'
//         }
//       },
//       _request: {
//         method: 'POST'
//       },
//       //@ts-ignore
//       id: '8effdbd7-417b-4b6f-a78e-05a5a11d4d87'
//     }
//   },
//   {
//     fullUrl:
//       '/fhir/TaskHistory/3af91322-60d5-4738-bd6a-505c13cc632e/_history/3af91322-60d5-4738-bd6a-505c13cc632e' as URLReference,
//     resource: {
//       resourceType: 'Task',
//       //@ts-ignore
//       status: 'accepted',
//       intent: 'proposal',
//       code: {
//         coding: [
//           {
//             system: 'http://opencrvs.org/specs/types',
//             code: 'BIRTH'
//           }
//         ]
//       },
//       focus: {
//         reference: 'Composition/ef1bd844-a72b-42c3-b12b-13cb2a7c157c'
//       },
//       id: '3af91322-60d5-4738-bd6a-505c13cc632e' as UUID,
//       requester: {
//         agent: {
//           reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
//         }
//       },
//       identifier: [
//         {
//           system: 'http://opencrvs.org/specs/id/draft-id',
//           value: '5a8b49c6-f61d-4891-a237-ffcd0ef4f08e'
//         },
//         {
//           system: 'http://opencrvs.org/specs/id/birth-tracking-id',
//           value: 'B48K21W'
//         }
//       ],
//       extension: [
//         {
//           url: 'http://opencrvs.org/specs/extension/contact-person-email',
//           valueString: 'nileeeem36@gmail.com'
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regAssigned'
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastUser',
//           valueReference: {
//             reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
//           }
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastLocation',
//           valueReference: {
//             reference: 'Location/4bf67dc1-8412-4276-bbd0-05409e9bba1e'
//           }
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastOffice',
//           valueReference: {
//             reference: 'Location/7d9f973f-f606-42f8-a92e-58953f0576ba'
//           }
//         }
//       ],
//       lastModified: '2024-01-01T08:05:20.523Z',
//       businessStatus: {
//         coding: [
//           {
//             system: 'http://opencrvs.org/specs/reg-status',
//             code: 'ARCHIVED'
//           }
//         ]
//       },
//       meta: {
//         lastUpdated: '2024-01-01T08:05:20.526+00:00',
//         versionId: '3af91322-60d5-4738-bd6a-505c13cc632e'
//       },
//       _transforms: {
//         meta: {
//           lastUpdated: '2024-01-01T08:05:20.526Z'
//         }
//       },
//       _request: {
//         method: 'PUT'
//       }
//     }
//   },
//   {
//     fullUrl:
//       '/fhir/TaskHistory/529a2252-597f-4651-9c53-fb0b68403247/_history/529a2252-597f-4651-9c53-fb0b68403247' as URLReference,
//     resource: {
//       resourceType: 'TaskHistory',
//       //@ts-ignore
//       status: 'accepted',
//       intent: 'proposal',
//       code: {
//         coding: [
//           {
//             system: 'http://opencrvs.org/specs/types',
//             code: 'BIRTH'
//           }
//         ]
//       },
//       focus: {
//         reference: 'Composition/ef1bd844-a72b-42c3-b12b-13cb2a7c157c'
//       },
//       id: '529a2252-597f-4651-9c53-fb0b68403247' as UUID,
//       requester: {
//         agent: {
//           reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
//         }
//       },
//       identifier: [
//         {
//           system: 'http://opencrvs.org/specs/id/draft-id',
//           value: '5a8b49c6-f61d-4891-a237-ffcd0ef4f08e'
//         },
//         {
//           system: 'http://opencrvs.org/specs/id/birth-tracking-id',
//           value: 'B48K21W'
//         }
//       ],
//       extension: [
//         {
//           url: 'http://opencrvs.org/specs/extension/contact-person-email',
//           valueString: 'nileeeem36@gmail.com'
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastUser',
//           valueReference: {
//             reference: 'Practitioner/8c3ce648-5a04-4e19-8ffb-5b98019ef100'
//           }
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastLocation',
//           valueReference: {
//             reference: 'Location/4bf67dc1-8412-4276-bbd0-05409e9bba1e'
//           }
//         },
//         {
//           url: 'http://opencrvs.org/specs/extension/regLastOffice',
//           valueString: 'Ibombo District Office',
//           valueReference: {
//             reference: 'Location/7d9f973f-f606-42f8-a92e-58953f0576ba'
//           }
//         }
//       ],
//       reason: {
//         text: ''
//       },
//       statusReason: {
//         text: ''
//       },
//       lastModified: '2024-01-01T08:05:31.725Z',
//       businessStatus: {
//         coding: [
//           {
//             system: 'http://opencrvs.org/specs/reg-status',
//             code: 'ARCHIVED'
//           }
//         ]
//       },
//       meta: {
//         lastUpdated: '2024-01-01T08:05:31.743+00:00',
//         versionId: '529a2252-597f-4651-9c53-fb0b68403247'
//       },
//       _transforms: {
//         meta: {
//           lastUpdated: '2024-01-01T08:05:31.743Z'
//         }
//       },
//       _request: {
//         method: 'PUT'
//       }
//     }
//   }
// ]

describe('reinstate record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after reinstating a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const birthRecord: SavedBundle = cloneDeep(READY_FOR_REVIEW_BIRTH_RECORD)
    const birthRecordWithoutTask = {
      ...birthRecord,
      entry: birthRecord.entry.filter((e) => e.resource.resourceType !== 'Task')
    }
    const archivedRecordEntriesWithTaskHistory =
      birthRecordWithoutTask.entry.concat(mockTaskHistoryEntries)

    const archivedBundleWithTaskHistory = {
      resourceType: 'Bundle',
      type: 'document',
      entry: archivedRecordEntriesWithTaskHistory
    }

    // Fetches a record from search
    mswServer.use(
      rest.get(
        'http://localhost:9090/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e',
        (_, res, ctx) => {
          return res(ctx.json(archivedBundleWithTaskHistory))
        }
      )
    )

    // Sends bundle to metrics
    mswServer.use(
      rest.post(
        'http://localhost:1050/events/birth/mark-reinstated',
        (_, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/reinstate',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const reinstatedEndpointResponse: ReadyForReviewRecord | RegisteredRecord =
      JSON.parse(res.payload)

    expect(res.statusCode).toBe(200)
    expect(getRegStatus(reinstatedEndpointResponse)).toBe('DECLARED')
  })
})
