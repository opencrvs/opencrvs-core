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
import type { Snapshot } from '../bindings/snapshot'
import { DEFAULT_HOSTS } from '../plan/dependencyHosts'

const EMAIL_SECRETS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'SMTP_SECURE',
  'SENDER_EMAIL_ADDRESS',
  'ALERT_EMAIL'
]

// The dependencies file stores each "Use built-in component" flag. Without it (an environment that has
// only GitHub, or only the services file), a dependency is built in unless it has a host of its own. The
// services file holds the address in the cluster for a built-in one, so that does not count. The
// credentials do not tell: every environment has them, because the services always need them.
const DEPENDENCY_HOSTS = {
  USE_BUILTIN_ELASTICSEARCH: 'ELASTICSEARCH_HOST',
  USE_BUILTIN_RUSTFS: 'S3_HOST',
  USE_BUILTIN_POSTGRES: 'POSTGRES_HOST',
  USE_BUILTIN_REDIS: 'REDIS_HOST',
  // The collector has no chart file of its own yet, so its endpoint is all there is to go by.
  USE_BUILTIN_OTEL_COLLECTOR: 'OTEL_COLLECTOR_ENDPOINT'
}

// Nothing stores the environment type, so it is only suggested from well-known names. As in the
// CLI there are two types: staging holds PII data, so it counts as production.
const TYPES: Record<string, string> = {
  development: 'non-production',
  dev: 'non-production',
  qa: 'non-production',
  staging: 'production',
  production: 'production',
  prod: 'production'
}

export const suggestType = (environment: string): string | undefined => TYPES[environment.toLowerCase()]

// The page switches are not stored either; they follow from what the environment already has.
export function inferToggles(snapshot: Snapshot): Record<string, unknown> {
  const { values, definedSecrets } = snapshot
  const has = (question: string) => question in values
  const workers = Array.isArray(values.WORKER_NODES) ? values.WORKER_NODES.length : 0

  // Like the CLI, an environment either backs up or restores, not both.
  const backup = has('BACKUP_HOST') || definedSecrets.includes('BACKUP_SERVER_USER')
  const restore = !backup && (has('RESTORE_HOST') || has('RESTORE_ENVIRONMENT_NAME'))
  // Backup and restore are under Dependencies, so they do not count as infrastructure.
  const infrastructure = workers > 0 || ['KUBE_API_HOST', 'KUBE_MASTER_NODE', 'KUBE_API_ALLOWED_CIDRS', 'USERS'].some(has)

  return {
    CONFIGURE_EMAIL: EMAIL_SECRETS.some((name) => definedSecrets.includes(name)),
    ...Object.fromEntries(
      Object.entries(DEPENDENCY_HOSTS)
        .filter(([toggle]) => !has(toggle)) // the dependencies file stores the flag itself
        .map(([toggle, host]) => [toggle, !has(host) || values[host] === DEFAULT_HOSTS[host]!(snapshot.environment)])
    ),
    USE_SENTRY: definedSecrets.includes('SENTRY_DSN'),
    // The disk can only be encrypted when the environment is created, and then it has a key and a size.
    ENABLE_ENCRYPTION: definedSecrets.includes('ENCRYPTION_KEY') || has('DISK_SPACE'),
    CONFIGURE_INFRASTRUCTURE: infrastructure,
    BACKUP_OR_RESTORE: backup ? 'backup' : restore ? 'restore' : 'none'
  }
}
