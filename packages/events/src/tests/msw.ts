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
import { setupServer } from 'msw/node'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { ActionType } from '@opencrvs/commons'
import { env } from '@events/environment'

const handlers = [
  http.post<PathParams<never>, { filenames: string[] }>(
    `${env.DOCUMENTS_URL}/presigned-urls`,
    async (info) => {
      const request = await info.request.json()
      const filenames = request.filenames.map(
        (x) =>
          `http://localhost:3535/ocrvs/${x}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250305%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20250305T100513Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=b9c1a0c9680fd344dcdfa32d2413319fcfc968090b674a3de5b66ef577d91e9b`
      )
      return HttpResponse.json(filenames)
    }
  ),
  http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
    return HttpResponse.json([
      tennisClubMembershipEvent,
      { ...tennisClubMembershipEvent, id: 'tennis-club-membership_premium' }
    ])
  }),
  // event.delete.test.ts
  http.head(`${env.DOCUMENTS_URL}/files/:filePath*`, () => {
    return HttpResponse.json({ ok: true })
  }),
  // event.delete.test.ts
  http.delete(`${env.DOCUMENTS_URL}/files/:filePath*`, () => {
    return HttpResponse.json({ ok: true })
  }),
  http.get(`${env.DOCUMENTS_URL}/list-files/:eventId*`, () => {
    return HttpResponse.json([])
  }),
  http.post(
    `${env.COUNTRY_CONFIG_URL}/trigger/events/:event/actions/:action`,
    (ctx) => {
      const payload =
        ctx.params.action === ActionType.REGISTER
          ? { registrationNumber: `ABC${Number(new Date())}` }
          : {}

      return HttpResponse.json(payload)
    }
  ),
  http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () => {
    return HttpResponse.json({
      primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902',
      role: 'REGISTRATION_AGENT',
      signature: '/ocrvs/signature.png'
    })
  }),
  // token exchange for `event.actions.register.confirm` and `event.actions.register.reject`
  // query params such as `subject_token`, `subject_token_type` omitted for simplicity
  http.post(`${env.AUTH_URL}/token`, () =>
    HttpResponse.json({
      access_token: 'some-token'
    })
  )
]

export const mswServer = setupServer(...handlers)
