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
export async function writeAuditLog(params: AuditLogParams) {
  const db = getClient()
  return db
    .insertInto('auditLog')
    .values({
      clientId: params.clientId,
      clientType: params.clientType,
      operation: params.operation,
      requestData: params.requestData,
      responseSummary:
        'responseSummary' in params ? params.responseSummary : null
    })
    .execute()
}

interface UserAuditLogQuery {
  subjectId: string
  skip?: number
  count?: number
  timeStart?: string
  timeEnd?: string
}

/**
 * Reads all audit log entries performed by a given user.
 */
export async function queryUserAuditLog({
  subjectId,
  skip = 0,
  count = 10,
  timeStart,
  timeEnd
}: UserAuditLogQuery) {
  const db = getClient()

  let query = db
    .selectFrom('auditLog')
    .selectAll()
    .where('clientId', '=', subjectId)

  if (timeStart) {
    query = query.where('createdAt', '>=', timeStart)
  }

  if (timeEnd) {
    query = query.where('createdAt', '<=', timeEnd)
  }

  const results = await query
    .orderBy('createdAt', 'desc')
    .limit(count)
    .offset(skip)
    .execute()

  let countQuery = db
    .selectFrom('auditLog')
    .select(({ fn }) => [fn.count<string>('id').as('count')])
    .where('clientId', '=', subjectId)

  if (timeStart) {
    countQuery = countQuery.where('createdAt', '>=', timeStart)
  }

  if (timeEnd) {
    countQuery = countQuery.where('createdAt', '<=', timeEnd)
  }

  const totalResult = await countQuery.executeTakeFirstOrThrow()

  return {
    results,
    total: Number(totalResult.count)
  }
}
