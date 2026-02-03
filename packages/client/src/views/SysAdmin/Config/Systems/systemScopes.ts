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
 * Derives SystemType from scopes array
 * This is the reverse operation - determining type from backend scopes for UI display
 * Note: Order matters - check more specific types before more generic ones
 */
export function getSystemTypeFromScopes(scopes: string[]): SystemType {
  // Check for unique identifying scopes first
  if (scopes.includes(SCOPES.NATIONALID)) {
    return SystemType.NationalId
  }
  if (scopes.includes(SCOPES.WEBHOOK)) {
    return SystemType.Webhook
  }
  if (scopes.includes(SCOPES.NOTIFICATION_API)) {
    return SystemType.Health
  }
  // Check IMPORT_EXPORT before RECORD_SEARCH since IMPORT_EXPORT includes RECORDSEARCH
  if (scopes.includes(SCOPES.RECORD_IMPORT)) {
    return SystemType.ImportExport
  }
  if (scopes.includes(SCOPES.RECORDSEARCH)) {
    return SystemType.RecordSearch
  }
  // Check for exact citizen portal scopes or parameterized versions
  if (
    scopes.includes('record.read') ||
    scopes.includes('record.create') ||
    scopes.includes('record.notify') ||
    scopes.some((s) => s.startsWith('record.read[')) ||
    scopes.some((s) => s.startsWith('record.create[')) ||
    scopes.some((s) => s.startsWith('record.notify['))
  ) {
    return SystemType.CitizenPortal
  }
  if (scopes.includes(SCOPES.RECORD_REINDEX) && scopes.length === 1) {
    return SystemType.Reindex
  }

  // Default fallback
  return SystemType.Health
}

