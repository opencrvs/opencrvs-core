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
import { format } from 'date-fns'
import { createClient } from '@opencrvs/toolkit/api'
import { GATEWAY_HOST, CREDENTIALS } from '../../constants'
import { getClientToken, getToken } from '../../helpers'

/**
 * Scopes for a system/integration client that can seed declarations whose
 * `createdAtLocation` is an arbitrary (including inactive) office. A
 * system-type token is the only way to set that field explicitly — for a
 * normal user token the server always overrides it with the user's own
 * `primaryOfficeId`. Covers both birth and
 * death events across notify/declare/register/archive.
 */
export const LOCATION_VERSIONING_INTEGRATION_SCOPES = [
  'type=record.create',
  'type=record.search',
  'type=record.read',
  'type=record.notify&event=birth',
  'type=record.notify&event=death',
  'type=record.declare&event=birth',
  'type=record.declare&event=death',
  'type=record.register&event=birth',
  'type=record.register&event=death',
  'type=record.archive&event=birth',
  'type=record.archive&event=death'
]

export async function createLocationVersioningIntegrationClient() {
  const systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

  const name = `Location versioning QA data ${format(new Date(), 'dd.MM. HH:mm:ss')}`

  const integrationClient = createClient(
    `${GATEWAY_HOST}/events`,
    `Bearer ${systemAdminToken}`
  )
  const integration = await integrationClient.integrations.create.mutate({
    name,
    scopes: LOCATION_VERSIONING_INTEGRATION_SCOPES
  })

  const clientToken = await getClientToken(
    integration.clientId,
    integration.clientSecret
  )

  return { clientToken }
}
