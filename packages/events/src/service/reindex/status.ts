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

import {
  getOrCreateClient,
  getReindexingStatusIndexName
} from '@events/storage/elasticsearch'

export type ReindexingProgress = {
  processed: number
}

type ReindexingStatus = {
  id: string
  timestamp: string
  status: 'running' | 'completed' | 'failed'
  progress: ReindexingProgress
  error_message: string | null
  completed_at: string | null
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const RETENTION_DAYS = 2

async function ensureReindexingStatusIndexExists(): Promise<void> {
  const client = getOrCreateClient()
  const indexName = getReindexingStatusIndexName()

  try {
    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            timestamp: { type: 'date' },
            status: { type: 'keyword' },
            progress: {
              type: 'object',
              properties: {
                processed: { type: 'integer' }
              }
            },
            error_message: { type: 'text' },
            completed_at: { type: 'date' }
          }
        }
      }
    })
  } catch (err: unknown) {
    // Ignore "resource_already_exists_exception" (HTTP 400)
    if ((err as { statusCode?: number }).statusCode !== 400) {
      throw err
    }
  }
}

// ---------------------------------------------------------------------------
// CRUD helpers
// ---------------------------------------------------------------------------

export async function createReindexingStatusEntry(
  id: string,
  timestamp: string
): Promise<void> {
  await ensureReindexingStatusIndexExists()
  const client = getOrCreateClient()

  await client.index({
    index: getReindexingStatusIndexName(),
    id,
    document: {
      id,
      timestamp,
      status: 'running',
      progress: { processed: 0 },
      error_message: null,
      completed_at: null
    },
    refresh: true
  })
}

export async function updateReindexingProgress(
  id: string,
  progress: ReindexingProgress
): Promise<void> {
  const client = getOrCreateClient()

  await client.update({
    index: getReindexingStatusIndexName(),
    id,
    doc: { progress }
  })
}

export async function completeReindexingStatus(
  id: string,
  completedAt: string
): Promise<void> {
  const client = getOrCreateClient()

  await client.update({
    index: getReindexingStatusIndexName(),
    id,
    doc: {
      status: 'completed',
      completed_at: completedAt
    },
    refresh: true
  })
}

export async function failReindexingStatus(
  id: string,
  errorMessage: string,
  completedAt: string
): Promise<void> {
  const client = getOrCreateClient()

  await client.update({
    index: getReindexingStatusIndexName(),
    id,
    doc: {
      status: 'failed',
      error_message: errorMessage,
      completed_at: completedAt
    },
    refresh: true
  })
}

export async function getReindexingStatusHistory(
  limit = 20
): Promise<ReindexingStatus[]> {
  await ensureReindexingStatusIndexExists()
  const client = getOrCreateClient()

  const response = await client.search<ReindexingStatus>({
    index: getReindexingStatusIndexName(),
    size: limit,
    sort: [{ timestamp: { order: 'desc' } }],
    query: { match_all: {} }
  })

  return response.hits.hits
    .map((hit) => hit._source)
    .filter((doc): doc is ReindexingStatus => doc !== undefined)
}

export async function pruneOldReindexingStatusEntries(): Promise<void> {
  const client = getOrCreateClient()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)

  await client.deleteByQuery({
    index: getReindexingStatusIndexName(),
    query: {
      range: {
        timestamp: {
          lt: cutoff.toISOString()
        }
      }
    }
  })
}
