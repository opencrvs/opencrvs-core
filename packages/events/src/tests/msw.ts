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
import { http, HttpResponse, PathParams } from 'msw'
import { env } from '@events/environment'
import { setupServer } from 'msw/node'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'

const handlers = [
  http.post<PathParams<never>, { filenames: string[] }>(
    `${env.DOCUMENTS_URL}/presigned-urls`,
    async (info) => {
      const request = await info.request.json()
      const filenames = request.filenames.map(
        (x) =>
          `${env.MINIO_URL}/ocrvs/${x}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250305%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20250305T100513Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=b9c1a0c9680fd344dcdfa32d2413319fcfc968090b674a3de5b66ef577d91e9b`
      )
      return HttpResponse.json(filenames)
    }
  ),
  http.get(`${env.COUNTRY_CONFIG_URL}/events`, (info) => {
    return HttpResponse.json([
      tennisClubMembershipEvent,
      { ...tennisClubMembershipEvent, id: 'TENNIS_CLUB_MEMBERSHIP_PREMIUM' }
    ])
  }),
  // event.delete.test.ts
  http.head(`${env.DOCUMENTS_URL}/files/:fileName`, (info) => {
    return HttpResponse.json({ ok: true })
  }),
  // event.delete.test.ts
  http.delete(`${env.DOCUMENTS_URL}/files/:fileName`, (info) => {
    return HttpResponse.json({ ok: true })
  })
]

export const mswServer = setupServer(...handlers)
