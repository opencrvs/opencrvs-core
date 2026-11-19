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
import { FIXTURES } from '../../scripts/fixtures'

// The form answers that correspond to a sample environment, as the form would hold them.
export function answersFor(name: string): Record<string, unknown> {
  const { inventory, dependencies, traefik, services } = FIXTURES[name]!
  const mode = dependencies.backup_enabled ? 'backup' : dependencies.restore_enabled ? 'restore' : 'none'
  return {
    ...(inventory.kube_api_host ? { KUBE_API_HOST: inventory.kube_api_host } : {}),
    WORKER_NODES: inventory.kube_worker_nodes.map((ip) => ({ ip })),
    USERS: inventory.users.map((user) => ({ ...user, ssh_keys: user.ssh_keys.join('\n') })),
    USE_BUILTIN_ELASTICSEARCH: true,
    USE_BUILTIN_RUSTFS: true,
    USE_BUILTIN_POSTGRES: true,
    USE_BUILTIN_REDIS: true,
    TRAEFIK_MODE: traefik.traefik_mode,
    ENVIRONMENT_TYPE: services.environment_type,
    TWO_FA_ENABLED: services.two_fa_enabled,
    MONITORING_ENABLED: dependencies.monitoring_enabled,
    // the sample environments switch OpenTelemetry on and off together with monitoring; they all use the built-in
    // collector, which is not stored and so not part of the answers
    OTEL_ENABLED: dependencies.monitoring_enabled,
    BACKUP_OR_RESTORE: mode,
    ...(mode === 'backup'
      ? { BACKUP_HOST: dependencies.backup_host, BACKUP_ENVIRONMENT_MODE: dependencies.backup_type }
      : {}),
    ...(mode === 'restore'
      ? {
          RESTORE_ENVIRONMENT_NAME: dependencies.restore_environment_name,
          RESTORE_HOST: dependencies.restore_host,
          RESTORE_ENVIRONMENT_MODE: dependencies.restore_type
        }
      : {})
  }
}
