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
import { runUpgrade } from './migrations/v2.0'
import {
  runEnvironmentInit,
  runEnvironmentSwarmToK8s,
  runEnvironmentUpdateWorkflows,
  runEnvironmentUsers
} from './environment'

const args = process.argv.slice(2)

const USAGE = `
Usage: opencrvs <command>

Commands:
  environment            Manage deployment environments
  upgrade                Upgrade an existing environment
  check-translations     Check translation files for completeness

Run 'opencrvs <command> --help' for more information on a command.
`.trim()

const UPGRADE_USAGE = `
Usage: opencrvs upgrade [options]

Upgrade the country config in the current working directory to the next
major version of OpenCRVS.

Options:
  --docker-swarm   Keep and merge the 'infrastructure/' directory with
                   upstream changes. Use this if your country deploys
                   OpenCRVS via Docker Swarm. When omitted, the
                   'infrastructure/' directory is deleted (default).
  -h, --help       Show this message.
`.trim()

function main() {
  const command = args[0]

  if (!command || command === '--help' || command === '-h') {
    console.log(USAGE)
    process.exit(0)
  }

  switch (command) {
    case 'environment':
      return handleEnvironment()
    case 'upgrade':
      return handleUpgrade()
    case 'check-translations':
      return handleCheckTranslations()
    default:
      console.error(`Unknown command: ${command}\n`)
      console.log(USAGE)
      process.exit(1)
  }
}

async function handleEnvironment() {
  const subcommand = args[1]

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(
      `
Usage: opencrvs environment <subcommand>

Subcommands:
  init              Initialise a new environment
  update-workflows  Update workflow environment options
  users             Manage environment users
  swarm-to-k8s      Migrate Docker Swarm configuration to Kubernetes
    `.trim()
    )
    process.exit(0)
  }

  switch (subcommand) {
    case 'init':
      return runEnvironmentCommand('initialisation', runEnvironmentInit)
    case 'update-workflows':
      return runEnvironmentCommand(
        'workflow update',
        runEnvironmentUpdateWorkflows
      )
    case 'users':
      return runEnvironmentCommand('user management', runEnvironmentUsers)
    case 'swarm-to-k8s':
      return runEnvironmentCommand(
        'Swarm to Kubernetes migration',
        runEnvironmentSwarmToK8s
      )
    default:
      console.error(`Unknown subcommand: environment ${subcommand}`)
      process.exit(1)
  }
}

async function runEnvironmentCommand(
  operation: string,
  command: () => Promise<void>
) {
  try {
    await command()
  } catch (error) {
    console.error(
      `Environment ${operation} failed:`,
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

async function handleUpgrade() {
  const upgradeArgs = args.slice(1)

  if (upgradeArgs.includes('--help') || upgradeArgs.includes('-h')) {
    console.log(UPGRADE_USAGE)
    process.exit(0)
  }

  const KNOWN_FLAGS = new Set(['--docker-swarm'])
  const unknownFlags = upgradeArgs.filter(
    (arg) => arg.startsWith('-') && !KNOWN_FLAGS.has(arg)
  )
  if (unknownFlags.length > 0) {
    console.error(`Unknown option(s): ${unknownFlags.join(', ')}\n`)
    console.log(UPGRADE_USAGE)
    process.exit(1)
  }

  const dockerSwarm = upgradeArgs.includes('--docker-swarm')

  console.log('Initiating upgrade...')
  try {
    await runUpgrade(dockerSwarm)
    console.log('Upgrade completed successfully!')
  } catch (error) {
    console.error('Upgrade failed:', error)
    process.exit(1)
  }
}

function handleCheckTranslations() {
  console.log('Checking translations...')
  console.warn('This command is not implemented yet!')
  process.exit(1)
}

main()
