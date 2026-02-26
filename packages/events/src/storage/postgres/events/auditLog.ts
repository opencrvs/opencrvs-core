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

import { logger } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import UserType from './schema/app/UserType'

export interface AuditLogParams {
  clientId: string
  clientType: UserType
  operation: string
  requestData: Record<string, unknown> | null
  responseSummary: Record<string, unknown> | null
}

/**
 * Writes an audit log entry for a system client operation.
 *
 * All parameters must be supplied explicitly by the caller —
 * do not pass tokens or context objects directly.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const db = getClient()
    await db.insertInto('auditLog').values(params).execute()
  } catch (error) {
    logger.error(
      { error, operation: params.operation, clientId: params.clientId },
      'Failed to write audit log entry'
    )
  }
}
