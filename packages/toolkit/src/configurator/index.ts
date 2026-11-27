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

/* eslint-disable no-console */
import { existsSync } from 'node:fs'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { assertNoOldInventoryLayout, migrateLayout } from './layout'
import {
  OLD_INVENTORY_DIR,
  WORKFLOWS_DIR,
  assertInfrastructureRepository
} from './paths'
import { startServer } from './server/start'
import {
  applyWorkflowUpdates,
  listEnvironments,
  planWorkflowUpdates,
  type WorkflowChange
} from './workflows'

/** What the commands work on and where they print. Defaults to the process. */
export interface Context {
  /** The infrastructure repository. */
  root: string
  log: (message: string) => void
}

const processContext = (): Context => ({
  root: process.cwd(),
  log: console.log
})

/**
 * Where the built page, `forms/bindings.yml` and `templates/` are. The bundled
 * `dist/cli.js` sits next to them (see build.sh).
 */
const defaultAssetsDir = () => join(__dirname, 'configurator-assets')

export interface InitOptions {
  port?: number
  host?: string
  assetsDir?: string
}

/**
 * Starts the configurator on a local port and resolves with the server once it
 * listens. The repository is not checked here, see `runConfiguratorInit`.
 */
export function startConfigurator(
  context: Context,
  { port = 4173, host, assetsDir = defaultAssetsDir() }: InitOptions = {}
): Promise<Server> {
  return startServer({ projectDir: context.root, assetsDir, port, host })
}

/** `opencrvs configurator init [--port <port>] [--host <host>]` */
export async function runConfiguratorInit(
  args: string[] = [],
  context: Context = processContext()
) {
  const { values } = parseArgs({
    args,
    options: { port: { type: 'string' }, host: { type: 'string' } }
  })
  const port = values.port === undefined ? 4173 : Number(values.port)
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port: ${values.port}`)
  }

  assertInfrastructureRepository(context.root)
  assertNoOldInventoryLayout(context.root)

  const assetsDir = defaultAssetsDir()
  if (!existsSync(join(assetsDir, 'ui', 'index.html'))) {
    throw new Error(
      'The configurator page is not built. Build the toolkit first (pnpm build in packages/toolkit).'
    )
  }

  const server = await startConfigurator(context, {
    port,
    host: values.host,
    assetsDir
  })
  const { port: listening } = server.address() as AddressInfo
  context.log(`OpenCRVS configurator: http://localhost:${listening}`)
  context.log(`Repository: ${context.root}`)
  context.log('Press Ctrl+C to stop.')

  // Resolves when the user stops it, so that the process can end.
  await new Promise<void>((resolve) => {
    const stop = () => {
      server.close(() => resolve())
      server.closeAllConnections()
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
}

const describe = (change: WorkflowChange) =>
  `${change.file} (${change.environments.join(', ')})`

function reportWorkflows(
  changes: WorkflowChange[],
  context: Context,
  dryRun: boolean
) {
  for (const change of changes) {
    switch (change.status) {
      case 'updated':
        context.log(
          `  ${dryRun ? 'would update' : '✓ updated'} ${describe(change)}`
        )
        break
      case 'unchanged':
        context.log(`  = ${change.file} is up to date`)
        break
      case 'not-found':
        context.log(
          `  ↷ skipped ${change.file} (not found in this repository)`
        )
        break
      case 'no-environments':
        context.log(`  ↷ skipped ${change.file} (no environments to list)`)
        break
    }
    for (const warning of change.warnings) {
      context.log(`  ⚠ ${change.file}: ${warning}`)
    }
  }
}

function updateWorkflows(context: Context, dryRun: boolean) {
  const { infrastructure, application } = listEnvironments(context.root)
  context.log(
    `Servers (inventory.yml): ${infrastructure.join(', ') || 'none'}`
  )
  context.log(
    `Clusters (opencrvs-services): ${application.join(', ') || 'none'}`
  )

  // Plans every workflow first: nothing is written when one cannot be updated.
  const changes = planWorkflowUpdates(context.root)
  context.log(`\nWorkflows in ${WORKFLOWS_DIR}:`)
  if (!dryRun) applyWorkflowUpdates(context.root, changes)
  reportWorkflows(changes, context, dryRun)
}

/** `opencrvs configurator update-workflows [--dry-run]` */
export async function runConfiguratorUpdateWorkflows(
  args: string[] = [],
  context: Context = processContext()
) {
  const { values } = parseArgs({
    args,
    options: { 'dry-run': { type: 'boolean' } }
  })
  assertInfrastructureRepository(context.root)
  updateWorkflows(context, values['dry-run'] ?? false)
}

/** `opencrvs configurator upgrade` */
export async function runConfiguratorUpgrade(
  context: Context = processContext()
) {
  assertInfrastructureRepository(context.root)
  const migration = migrateLayout(context.root)

  if (migration.moved.length + migration.skipped.length === 0) {
    context.log(`No old inventory files found at ${OLD_INVENTORY_DIR}`)
  } else {
    context.log('Migrating Ansible inventory files')
    for (const { from, to } of migration.moved) {
      context.log(`  ✓ moved ${from} -> ${to}`)
    }
    for (const { from, to } of migration.skipped) {
      context.log(`  ↷ skipped ${from}: ${to} already exists`)
    }
    if (migration.oldDirectoryRemoved) {
      context.log(`  ✓ removed empty ${OLD_INVENTORY_DIR}`)
    } else if (existsSync(join(context.root, OLD_INVENTORY_DIR))) {
      context.log(
        `  ⚠ ${OLD_INVENTORY_DIR} still has files in it, review it manually`
      )
    }
  }

  context.log('')
  updateWorkflows(context, false)

  context.log(
    migration.moved.length > 0
      ? '\n✓ Environment layout upgraded. Commit the changes into git.'
      : '\n✓ Environment layout already uses the current structure.'
  )
}
