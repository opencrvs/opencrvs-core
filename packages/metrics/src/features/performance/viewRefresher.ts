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
import { MongoClient } from 'mongodb'

/*
 * This creates new simplified data views in MongoDB for Metabase to read its data from.
 * This is required because our FHIR schema is too complex for real-time aggregations
 *
 * There can only be one data update ongoing at one time. This is because
 * - It takes significant processing to form these views
 * - Views are created in two steps for which we do not use transaction for. Having two runs at the same time might cause inconsistency in the data.
 *
 * View refresher is controlled by two flags
 * - One that tracks whether an update is in progress
 * - One that tracks if an uodate has been requested after the first update run started
 */
import * as Hapi from '@hapi/hapi'
import { getDashboardQueries } from '@metrics/configApi'
import client from '@metrics/config/hearthClient'

let updateInProgress = false
let nextUpdateRequested = false

export async function performanceDataRefreshHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  refresh().catch((error) => {
    logger.error(`Error on performance data refresh triggered: ${error}`)
  })
  return h.response({
    message: 'Successfully triggered performance data refresh',
    statusCode: 200
  })
}

export async function refresh() {
  if (updateInProgress) {
    logger.info('Performance materialised views already being refreshed')
    nextUpdateRequested = true
    return
  }
  logger.info('Refreshing performance materialised views')
  try {
    updateInProgress = true
    await refreshPerformanceMaterialisedViews(client)
    logger.info('Performance materialised views refreshed')
  } catch (error) {
    logger.error(`Error refreshing performances materialised views ${error}`)
  } finally {
    updateInProgress = false
    if (nextUpdateRequested) {
      nextUpdateRequested = false
      refresh()
    }
  }
}

async function refreshPerformanceMaterialisedViews(client: MongoClient) {
  const db = client.db()
  const queries = await getDashboardQueries()

  for (const { collection, aggregate } of queries) {
    await db
      .collection(collection)
      .aggregate(aggregate, { allowDiskUse: true })
      .toArray()
  }
}
