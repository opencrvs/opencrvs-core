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
import { monitorEventLoopDelay } from 'node:perf_hooks'
import { logger } from '@opencrvs/commons'
import { getPool } from '@events/storage/postgres/events'

const SAMPLE_INTERVAL_MS = 5000

/**
 * Samples the two things that can make this service slow without anything
 * looking broken, so a load problem can be told apart from a waiting problem.
 *
 * - `loopLag*` is how long the single JS thread was blocked. It rises when
 *   requests are doing CPU work (validation, event state derivation) rather
 *   than waiting on IO, since awaiting IO costs no CPU.
 * - `poolWaiting` is how many callers are queued for one of the Postgres
 *   pool's connections. The pool is created without `connectionTimeoutMillis`,
 *   so a caller waits indefinitely and the queue is otherwise invisible —
 *   it surfaces only as latency.
 *
 * Read them together:
 *
 *   high loopLagP99, poolWaiting 0   -> the JS thread is the ceiling
 *   low loopLagP99, poolWaiting > 0  -> the connection pool is the ceiling
 *   both                             -> the blocked loop is not releasing
 *                                       connections; treat the loop first
 */
export function startSaturationWorker() {
  const loopDelay = monitorEventLoopDelay({ resolution: 20 })
  loopDelay.enable()

  const timer = setInterval(() => {
    const pool = getPool()

    logger.info({
      msg: 'saturation',
      loopLagMeanMs: Number((loopDelay.mean / 1e6).toFixed(1)),
      loopLagP99Ms: Number((loopDelay.percentile(99) / 1e6).toFixed(1)),
      poolWaiting: pool.waitingCount,
      poolTotal: pool.totalCount,
      poolIdle: pool.idleCount
    })

    loopDelay.reset()
  }, SAMPLE_INTERVAL_MS)

  /*
   * Without this the interval keeps the process alive, holding up shutdown
   * and hanging anything that imports this module in a test run.
   */
  timer.unref()
}
