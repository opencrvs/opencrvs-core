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
import { Db, MongoClient } from 'mongodb'

/**
 * Migration to ensure all system clients have scopes array populated.
 * For systems that only have a type and no scopes, this migration will:
 * 1. Populate scopes based on their type
 * 2. Remove WEBHOOK type systems (deprecated)
 *
 * Scope mapping from type:
 * - HEALTH: ['notification-api', 'record.create', 'record.notify']
 * - NATIONAL_ID: ['nationalId']
 * - RECORD_SEARCH: ['recordsearch']
 * - IMPORT_EXPORT: ['record.import', 'record.export', 'recordsearch', 'user.data-seeding', 'record.reindex']
 * - REINDEX: ['record.reindex']
 * - WEBHOOK: (deprecated - will be removed)
 */

const DEFAULT_SCOPES_BY_TYPE: Record<string, string[]> = {
  HEALTH: ['notification-api'],
  NATIONAL_ID: ['nationalId'],
  RECORD_SEARCH: ['recordsearch'],
  IMPORT_EXPORT: [
    'record.import',
    'record.export',
    'recordsearch',
    'user.data-seeding',
    'record.reindex'
  ],
  REINDEX: ['record.reindex']
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    // First, delete any WEBHOOK type systems as they are deprecated
    await db.collection('systems').deleteMany({ type: 'WEBHOOK' })

    // Get all systems that need scopes populated
    const systems = await db.collection('systems').find({}).toArray()

    for (const system of systems) {
      // Skip if system already has scopes populated
      if (system.scope && system.scope.length > 0) {
        continue
      }

      const type = system.type as string
      const defaultScopes = DEFAULT_SCOPES_BY_TYPE[type]

      if (defaultScopes) {
        await db
          .collection('systems')
          .updateOne({ _id: system._id }, { $set: { scope: defaultScopes } })
      }
    }
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // This migration cannot be fully reversed as we cannot restore deleted WEBHOOK systems
  // The scopes field already exists in the schema, so no structural changes to reverse
  const session = client.startSession()
  try {
    // No-op: scopes field already exists and we cannot restore deleted webhooks
  } finally {
    await session.endSession()
  }
}
