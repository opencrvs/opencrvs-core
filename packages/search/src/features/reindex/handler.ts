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
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { v4 as uuid } from 'uuid'

import { prune } from './prune'
import { backupLegacyIndex, reindex, updateAliases } from './reindex'

export const IndexingStatus = {
  accepted: 'accepted',
  started: 'started',
  completed: 'completed',
  error: 'error'
} as const

export type IndexingStatus =
  (typeof IndexingStatus)[keyof typeof IndexingStatus]

const indexingStatuses: Record<string, IndexingStatus> = {}

export async function reindexHandler(
  _request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const jobId = uuid()

  process.nextTick(async () => {
    try {
      indexingStatuses[jobId] = IndexingStatus.started

      await backupLegacyIndex()
      await reindex()
      await updateAliases()
      await prune()
      indexingStatuses[jobId] = IndexingStatus.completed
    } catch (error) {
      logger.error(error)
      indexingStatuses[jobId] = IndexingStatus.error
    }
  })

  return h
    .response({
      message: `ElasticSearch reindexing started for job ${jobId}`,
      status: indexingStatuses[jobId] ?? IndexingStatus.accepted,
      jobId
    })
    .code(202)
}

export async function reindexStatusHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { jobId } = request.params as { jobId: string }

  const status = indexingStatuses[jobId]

  if (!status) {
    return h
      .response({
        message: 'ElasticSearch reindexing timestamp not found'
      })
      .code(404)
  }

  if (status === 'error') {
    return h
      .response({
        message:
          'Error when reindexing. Refer to search-service logs for details.',
        status
      })
      .code(500)
  }

  if (status === 'completed') {
    return h
      .response({
        message: `Reindexing for job ${jobId} completed`,
        status
      })
      .code(200)
  }

  return h
    .response({
      message: `ElasticSearch reindexing started for job ${jobId}`,
      status: indexingStatuses[jobId]
    })
    .code(200)
}
