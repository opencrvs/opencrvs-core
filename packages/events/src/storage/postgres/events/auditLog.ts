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

export type { AuditLogParams }

/**
 * Writes an audit log entry for a client operation.
 *
 * All parameters must be supplied explicitly by the caller —
 * do not pass tokens or context objects directly.
 */
export async function writeAuditLog(
  params: AuditLogParams
): Promise<void> {
  const db = getClient()
  return db
    .insertInto('auditLog')
    .values({
      clientId: params.clientId,
      clientType: params.clientType,
      operation: params.operation,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestData: params.requestData as Record<string, any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSummary: params.responseSummary as Record<string, any>
    })
    .execute()
    .then(() => undefined)
}
