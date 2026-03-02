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

import { AuditLogParams } from '@opencrvs/commons/events'
import { getClient } from '@events/storage/postgres/events'

/**
 * Writes an audit log entry for a client operation.
 *
 * All parameters must be supplied explicitly by the caller —
 * do not pass tokens or context objects directly.
 */
export async function writeAuditLog(
  params: AuditLogParams
) {
  const db = getClient()
  return db
    .insertInto('auditLog')
    .values({
      clientId: params.clientId,
      clientType: params.clientType,
      operation: params.operation,
      requestData: params.requestData,
      responseSummary: params.responseSummary
    })
    .execute()
}

/**
 * Reads audit log entries for a specific client, with optional date range filters and pagination.
 */
export async function readAuditLog({
  clientId,
  from,
  to,
  skip = 0,
  count = 10
}: {
  clientId: string
  from?: string
  to?: string
  skip?: number
  count?: number
}) {
  const db = getClient()

  let baseQuery = db
    .selectFrom('auditLog')
    .where('clientId', '=', clientId)

  if (from) {
    baseQuery = baseQuery.where('createdAt', '>=', from)
  }
  if (to) {
    baseQuery = baseQuery.where('createdAt', '<=', to)
  }

  const [results, totalResult] = await Promise.all([
    baseQuery
      .selectAll()
      .orderBy('createdAt', 'desc')
      .limit(count)
      .offset(skip)
      .execute(),
    baseQuery
      .select(({ fn }) => [fn.count<string>('id').as('count')])
      .executeTakeFirst()
  ])

  return {
    results,
    total: totalResult?.count ? Number(totalResult.count) : 0
  }
}
