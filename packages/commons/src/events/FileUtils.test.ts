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

import { EventDocument } from './EventDocument'
import { getFilePathsFromEvent } from './FileUtils'

test('file references finder returns all file references from action document', () => {
  const data = {
    id: '105b69b3-415f-4e53-b912-ef71484cb6c0',
    type: 'tennis-club-membership',
    createdAt: '2025-09-18T07:54:00.073Z',
    updatedAt: '2025-09-18T07:54:00.073Z',
    actions: [
      {
        id: '64718c96-f85f-4940-89bb-de713d060f2c',
        transactionId: 'tmp-ed5518a7-a2bb-45f9-a393-fcd358e06c94',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:54:00.073Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        declaration: {},
        status: 'Accepted',
        type: 'CREATE'
      },
      {
        id: '72b78b6e-5121-45e1-8e09-f5cd6d9466b8',
        transactionId: 'tmp-ed5518a7-a2bb-45f9-a393-fcd358e06c94',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:54:00.073Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        declaration: {},
        status: 'Accepted',
        type: 'ASSIGN',
        assignedTo: '68c122bc28f080e722d4927c'
      },
      {
        id: 'dc5a0fd6-90b9-4540-96ba-55e79e89dddf',
        transactionId: '06f057c3-8904-4570-9a23-8c558a2af46b',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:55:04.728Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        declaration: {
          'applicant.dob': '2024-02-03',
          'applicant.name': {
            surname: 'asfasd',
            firstname: 'asdfas',
            middlename: 'fasdf'
          },
          'senior-pass.id': '23423423423',
          'applicant.image': {
            path: '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/e1fb6470-a836-4346-b46b-982304eb25df.jpeg',
            type: 'image/jpeg',
            originalFilename: 'IMG_5601 2.jpeg'
          },
          'recommender.none': true
        },
        annotation: {
          'review.signature': {
            path: '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/ff45a750-d09e-4d06-b2c7-eda3f4b32417.png',
            type: 'image/png',
            originalFilename: 'signature-review____signature-1758182094797.png'
          }
        },
        status: 'Requested',
        type: 'DECLARE'
      }
    ],
    trackingId: 'ICJY4Z'
  } as EventDocument

  expect(getFilePathsFromEvent(data)).toEqual([
    '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/e1fb6470-a836-4346-b46b-982304eb25df.jpeg',
    '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/ff45a750-d09e-4d06-b2c7-eda3f4b32417.png'
  ])
})
test('file references finder considers files in a rejected action as existing file references', () => {
  const data = {
    id: '105b69b3-415f-4e53-b912-ef71484cb6c0',
    type: 'tennis-club-membership',
    createdAt: '2025-09-18T07:54:00.073Z',
    updatedAt: '2025-09-18T07:54:00.073Z',
    actions: [
      {
        id: '64718c96-f85f-4940-89bb-de713d060f2c',
        transactionId: 'tmp-ed5518a7-a2bb-45f9-a393-fcd358e06c94',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:54:00.073Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        declaration: {},
        status: 'Accepted',
        type: 'CREATE'
      },
      {
        id: '72b78b6e-5121-45e1-8e09-f5cd6d9466b8',
        transactionId: 'tmp-ed5518a7-a2bb-45f9-a393-fcd358e06c94',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:54:00.073Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        declaration: {},
        status: 'Accepted',
        type: 'ASSIGN',
        assignedTo: '68c122bc28f080e722d4927c'
      },
      {
        id: 'dc5a0fd6-90b9-4540-96ba-55e79e89dddf',
        transactionId: '06f057c3-8904-4570-9a23-8c558a2af46b',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:55:04.728Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        declaration: {
          'applicant.dob': '2024-02-03',
          'applicant.name': {
            surname: 'asfasd',
            firstname: 'asdfas',
            middlename: 'fasdf'
          },
          'senior-pass.id': '23423423423',
          'applicant.image': {
            path: '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/e1fb6470-a836-4346-b46b-982304eb25df.jpeg',
            type: 'image/jpeg',
            originalFilename: 'IMG_5601 2.jpeg'
          },
          'recommender.none': true
        },
        annotation: {
          'review.signature': {
            path: '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/ff45a750-d09e-4d06-b2c7-eda3f4b32417.png',
            type: 'image/png',
            originalFilename: 'signature-review____signature-1758182094797.png'
          }
        },
        status: 'Requested',
        type: 'DECLARE'
      },
      {
        id: 'ss23423-90b9-4540-96ba-55e79e89dddf',
        transactionId: '06f057c3-8904-4570-9a23-8c558a2af46b',
        createdByUserType: 'user',
        createdAt: '2025-09-18T07:55:04.728Z',
        createdBy: '68c122bc28f080e722d4927c',
        createdByRole: 'LOCAL_REGISTRAR',
        createdAtLocation: 'f3da7778-161e-44a1-9e64-ab93dc1fe77f',
        originalActionId: 'dc5a0fd6-90b9-4540-96ba-55e79e89dddf',
        status: 'Rejected',
        type: 'DECLARE'
      }
    ],
    trackingId: 'ICJY4Z'
  } as EventDocument

  expect(getFilePathsFromEvent(data)).toEqual([
    '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/e1fb6470-a836-4346-b46b-982304eb25df.jpeg',
    '/ocrvs/105b69b3-415f-4e53-b912-ef71484cb6c0/ff45a750-d09e-4d06-b2c7-eda3f4b32417.png'
  ])
})
