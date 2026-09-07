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
import { main as addExplicitCorrectionFlags } from './add-explicit-correction-flags'
import { main as addRecoveryLinkNotifications } from './add-recovery-link-notifications'
import { main as addTranslations } from './add-translations'
import { main as enableTelemetry } from './enable-telemetry'

/**
 * Steps a Docker Swarm deployment has to make by hand, because they live in the
 * country config's own `infrastructure/` compose files rather than in `src/`,
 * and no codemod in this folder touches them. A Kubernetes deployment gets all
 * four from the charts and the `postgres-on-deploy` job instead.
 */
const DOCKER_SWARM_MANUAL_STEPS = [
  'Remove the `mongo1` and `influxdb` services from your compose files — MongoDB and InfluxDB are gone in this release.',
  'Remove the `legacy-data-migration` service from your compose files. It only ever migrated MongoDB data during the v2.0 upgrade, and the migration it ran no longer exists.',
  'Change the postgres image from `docker.io/chumaky/postgres_mongo_fdw:17.6_fdw5.5.2` back to `postgres:17.6`. The `mongo_fdw` build was only needed for the v2.0 legacy-data migration.',
  'Run `DROP EXTENSION mongo_fdw CASCADE;` against the events database as a Postgres superuser, if this deployment came through v2.0. The migration that tries this only warns, because the role migrations run as does not own the extension. Until it is dropped, a pg_dump/pg_restore of the database into a v2.1 cluster fails.',
  'Run `assets/deployment/reindex.sh` after deploying. `deploy.sh` does not call it, and this release adds `legalStatuses.NOTIFIED` to the Elasticsearch mapping, so records indexed before the upgrade carry none of it until a reindex.'
]

export interface UpgradeResult {
  /**
   * Everything the upgrade could not do for the country config, gathered from
   * every codemod. Empty means the upgrade is genuinely complete.
   */
  outstanding: string[]
}

/**
 * Run the upgrade process for the country config in the current working
 * directory.
 *
 * Each codemod is best-effort: a country config that renamed or restructured
 * the files a codemod targets keeps its own structure, and the codemod records
 * what it could not do rather than guessing. Those records are collected here
 * so the caller can present one list of what is left, instead of the operator
 * having to notice individual warnings in the scrollback.
 */
export async function runUpgrade(dockerSwarm: boolean): Promise<UpgradeResult> {
  const outstanding: string[] = []

  outstanding.push(...(await addExplicitCorrectionFlags()))
  outstanding.push(...(await addRecoveryLinkNotifications()))
  outstanding.push(...(await addTranslations()))
  outstanding.push(...(await enableTelemetry()))

  if (dockerSwarm) {
    outstanding.push(...DOCKER_SWARM_MANUAL_STEPS)
  }

  return { outstanding }
}
