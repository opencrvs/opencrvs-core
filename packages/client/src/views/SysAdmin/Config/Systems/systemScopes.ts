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

import { SystemType } from '@client/utils/gateway'
import { SCOPES } from '@opencrvs/commons/client'

/**
 * Maps a SystemType to its corresponding scopes array
 * This function translates the client-side type concept to backend scopes
 */
export function getSystemScopesFromType(
  systemType: SystemType,
  eventIds: string[]
): string[] {
  const baseScopes: Record<SystemType, string[]> = {
    [SystemType.Health]: ['record.create', 'record.notify'],
    [SystemType.NationalId]: [SCOPES.NATIONALID],
    [SystemType.RecordSearch]: [SCOPES.RECORDSEARCH],
    [SystemType.ImportExport]: [
      SCOPES.RECORD_IMPORT,
      SCOPES.RECORD_EXPORT,
      SCOPES.RECORDSEARCH,
      SCOPES.USER_DATA_SEEDING,
      SCOPES.RECORD_REINDEX
    ],
    [SystemType.CitizenPortal]: ['record.read', 'record.create', 'record.notify'],
    [SystemType.Reindex]: [SCOPES.RECORD_REINDEX]
  }

  return baseScopes[systemType]
}

/**
 * Derives SystemType from scopes array for display purposes
 * Used in audit history to show appropriate type label
 */
export function getSystemTypeFromScopes(scopes: string[]): string {
  // Check for unique identifying scopes
  if (scopes.includes(SCOPES.NATIONALID)) {
    return 'NATIONAL_ID'
  }
  if (scopes.includes(SCOPES.RECORDSEARCH) && !scopes.includes(SCOPES.RECORD_IMPORT)) {
    return 'RECORD_SEARCH'
  }
  if (scopes.includes(SCOPES.RECORD_IMPORT)) {
    return 'IMPORT_EXPORT'
  }
  if (scopes.includes(SCOPES.RECORD_REINDEX) && scopes.length === 1) {
    return 'REINDEX'
  }
  // Check for citizen portal scopes
  if (
    scopes.includes('record.read') ||
    scopes.some((s) => s.startsWith('record.read'))
  ) {
    return 'CITIZEN_PORTAL'
  }
  // Default to HEALTH for record.create/record.notify
  if (
    scopes.includes('record.create') ||
    scopes.includes('record.notify')
  ) {
    return 'HEALTH'
  }

  // Default fallback
  return 'HEALTH'
}

