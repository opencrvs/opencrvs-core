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
import Handlebars from 'handlebars'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import type { Bindings } from '../ui/bindings/bindings.ts'
import { builtInValues } from '../ui/plan/templateValues.ts'

// Sample environments rendered from the real CLI templates, so there is something to
// read back. The values mirror what `yarn environment:init` would pass to the templates.
interface FixtureUser {
  name: string
  ssh_keys: string[]
  state: 'present' | 'absent'
  role: 'admin' | 'operator'
}

interface Fixture {
  inventory: {
    kube_api_host: string
    kube_worker_nodes: string[]
    backup_host: string
    users: FixtureUser[]
  }
  dependencies: {
    monitoring_enabled: boolean
    backup_enabled: boolean
    backup_type: string
    backup_host: string
    restore_enabled: boolean
    restore_type: string
    restore_environment_name: string
    restore_host: string
  }
  // The CLI keeps the mode only as `traefik_mode`, and turns it into the two flags the template reads.
  traefik: {
    traefik_mode: 'lets_encrypt' | 'static_ssl' | 'custom'
  }
  services: {
    environment_type: 'non-production' | 'production'
    two_fa_enabled: boolean
  }
}

const ALICE = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl alice@laptop'
const BOB = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7bob bob@server'

const NO_BACKUP = { backup_enabled: false, backup_type: 'dump', backup_host: '' }
const NO_RESTORE = { restore_enabled: false, restore_type: 'dump', restore_environment_name: '', restore_host: '' }

export const FIXTURES: Record<string, Fixture> = {
  // single node, nothing optional
  dev: {
    inventory: {
      kube_api_host: '',
      kube_worker_nodes: [],
      backup_host: '',
      users: [{ name: 'dev-admin', ssh_keys: [ALICE], state: 'present', role: 'admin' }]
    },
    dependencies: { monitoring_enabled: false, ...NO_BACKUP, ...NO_RESTORE },
    traefik: { traefik_mode: 'custom' },
    services: { environment_type: 'non-production', two_fa_enabled: false }
  },
  qa: {
    inventory: {
      kube_api_host: '10.1.0.5',
      kube_worker_nodes: [],
      backup_host: '',
      users: [{ name: 'alice', ssh_keys: [ALICE], state: 'present', role: 'admin' }]
    },
    dependencies: { monitoring_enabled: true, ...NO_BACKUP, ...NO_RESTORE },
    traefik: { traefik_mode: 'lets_encrypt' },
    services: { environment_type: 'non-production', two_fa_enabled: false }
  },
  // restores from prod; one worker; a user without keys and a disabled one
  uat: {
    inventory: {
      kube_api_host: '10.2.0.5',
      kube_worker_nodes: ['10.2.0.11'],
      backup_host: '',
      users: [
        { name: 'alice', ssh_keys: [ALICE], state: 'present', role: 'admin' },
        { name: 'bob', ssh_keys: [], state: 'absent', role: 'operator' }
      ]
    },
    dependencies: {
      monitoring_enabled: true,
      ...NO_BACKUP,
      restore_enabled: true,
      restore_type: 'dump',
      restore_environment_name: 'prod',
      restore_host: '203.0.113.20'
    },
    traefik: { traefik_mode: 'static_ssl' },
    services: { environment_type: 'non-production', two_fa_enabled: true }
  },
  // two workers and differential backups; a user with two keys
  prod: {
    inventory: {
      kube_api_host: '10.3.0.5',
      kube_worker_nodes: ['10.3.0.11', '10.3.0.12'],
      backup_host: '203.0.113.9',
      users: [
        { name: 'alice', ssh_keys: [ALICE, BOB], state: 'present', role: 'admin' },
        { name: 'bob', ssh_keys: [BOB], state: 'present', role: 'operator' }
      ]
    },
    dependencies: {
      monitoring_enabled: true,
      backup_enabled: true,
      backup_type: 'differential',
      backup_host: '203.0.113.9',
      ...NO_RESTORE
    },
    traefik: { traefik_mode: 'lets_encrypt' },
    services: { environment_type: 'production', two_fa_enabled: true }
  }
}

// The addresses of the built-in components are not listed here: they come from the same place as in the form
// (DEFAULT_HOSTS, through the bindings), because the templates are this project's own where they use them.
// Everything else below is what the CLI would pass, spelled out on purpose, so a form that gets it wrong shows up.
const bindings = parse(readFileSync(join(import.meta.dirname, '..', 'forms', 'bindings.yml'), 'utf8')) as Bindings

function compile(source: string) {
  const env = Handlebars.create()
  // Same helper as the CLI's: worker labels start at 2.
  env.registerHelper('data_label_idx', (value: unknown) => Number.parseInt(String(value), 10) + 2)
  return env.compile(source)
}

// Renders the templates the way the CLI does. `readTemplate` takes a path under templates/.
export function renderFixture(
  name: string,
  readTemplate: (path: string) => string
): Record<string, string> {
  const fixture = FIXTURES[name]
  if (!fixture) throw new Error(`No fixture named ${name}`)
  const { inventory, dependencies, traefik, services } = fixture

  const singleNode = inventory.kube_worker_nodes.length > 0 || inventory.backup_host ? 'false' : 'true'
  const builtIn = (template: string) => builtInValues(template, name, bindings)
  return {
    'inventory.yml': compile(readTemplate('inventory/inventory.template.yml'))({
      ...inventory,
      single_node: singleNode
    }),
    'dependencies/values.yaml': compile(readTemplate('charts-values/dependencies/values.yaml'))({
      env: name,
      // every dependency is built in, as when nothing is changed on the Dependencies page
      rustfs_enabled: true,
      elasticsearch_enabled: true,
      postgres_enabled: true,
      redis_enabled: true,
      ...builtIn('charts-values/dependencies/values.yaml'),
      s3_migrate_from_minio_to_rustfs: false,
      ...dependencies
    }),
    'traefik/values.yaml': compile(readTemplate('charts-values/traefik/values.yaml'))({
      env: name,
      monitoring_enabled: dependencies.monitoring_enabled,
      lets_encrypt: traefik.traefik_mode === 'lets_encrypt',
      static_ssl: traefik.traefik_mode === 'static_ssl',
      ...builtIn('charts-values/traefik/values.yaml')
    }),
    // `otel_enabled` is this project's name for what the CLI's template reads as `monitoring_enabled`.
    'opencrvs-services/values.yaml': compile(readTemplate('charts-values/opencrvs-services/values.yaml'))({
      env: name,
      opencrvs_environment: name,
      ...services,
      otel_enabled: dependencies.monitoring_enabled,
      restore_enabled: dependencies.restore_enabled,
      ...builtIn('charts-values/opencrvs-services/values.yaml')
    })
  }
}
