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

import { getCurrentEventState } from '.'

describe('correction requests', () => {
  test('proposed correction data is not applied before the correction request is approved', () => {
    const state = getCurrentEventState({
      type: 'TENNIS_CLUB_MEMBERSHIP',
      id: 'f743a5d5-19d4-44eb-9b0f-301a2d823bcf',
      trackingId: 'TEST12',
      createdAt: '2025-01-23T02:21:38.343Z',
      updatedAt: '2025-01-23T02:21:42.230Z',
      actions: [
        {
          type: 'CREATE',
          createdAt: '2025-01-23T02:21:38.343Z',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          draft: false,
          id: '63d19916-dcc8-4cf2-8161-eab9989765e8',
          data: {}
        },
        {
          draft: false,
          data: { name: 'John Doe' },
          type: 'DECLARE',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:39.161Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'eb4c18e5-93bc-42f6-b110-909815f6a7c8'
        },
        {
          draft: false,
          data: {},
          type: 'REGISTER',
          identifiers: {
            trackingId: 'b96cb6f2-ff62-4ed3-97ff-c0b8f1f98ce8',
            registrationNumber: '47fb252f-9d23-429c-a33e-2db3481bc9fb'
          },
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:40.182Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'bec6b33a-7a5f-4acd-9638-9e77db1800e2'
        },
        {
          draft: false,
          data: { name: 'Doe John' },
          type: 'REQUEST_CORRECTION',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:41.206Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '8f4d3b15-dfe9-44fb-b2b4-4b6e294c1c8d'
        }
      ]
    })

    expect(state.data.name).toBe('John Doe')
  })
  test('proposed correction data is applied after the correction request is approved', () => {
    const state = getCurrentEventState({
      type: 'TENNIS_CLUB_MEMBERSHIP',
      id: 'f743a5d5-19d4-44eb-9b0f-301a2d823bcf',
      trackingId: 'TEST12',
      createdAt: '2025-01-23T02:21:38.343Z',
      updatedAt: '2025-01-23T02:21:42.230Z',
      actions: [
        {
          type: 'CREATE',
          createdAt: '2025-01-23T02:21:38.343Z',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          draft: false,
          id: '63d19916-dcc8-4cf2-8161-eab9989765e8',
          data: {}
        },
        {
          draft: false,
          data: { name: 'John Doe' },
          type: 'DECLARE',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:39.161Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'eb4c18e5-93bc-42f6-b110-909815f6a7c8'
        },
        {
          draft: false,
          data: {},
          type: 'REGISTER',
          identifiers: {
            trackingId: 'b96cb6f2-ff62-4ed3-97ff-c0b8f1f98ce8',
            registrationNumber: '47fb252f-9d23-429c-a33e-2db3481bc9fb'
          },
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:40.182Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'bec6b33a-7a5f-4acd-9638-9e77db1800e2'
        },
        {
          draft: false,
          data: { name: 'Doe John' },
          type: 'REQUEST_CORRECTION',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:41.206Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '8f4d3b15-dfe9-44fb-b2b4-4b6e294c1c8d'
        },
        {
          draft: false,
          data: {},
          requestId: '8f4d3b15-dfe9-44fb-b2b4-4b6e294c1c8d',
          type: 'APPROVE_CORRECTION',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdAt: '2025-01-23T02:21:42.230Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '94d5a963-0125-4d31-85f0-6d77080758f4'
        }
      ]
    })

    expect(state.data.name).toBe('Doe John')
  })
})
