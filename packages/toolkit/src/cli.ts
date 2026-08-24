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
import { runUpgrade } from './migrations/v2.1'
import { check, writeMissing } from './translations/check'
import {
  runEnvironmentInit,
  runEnvironmentSwarmToK8s,
  runEnvironmentUpdateWorkflows,
  runEnvironmentUpgrade,
  runEnvironmentUsers
} from './environment'
import { runVerifyEndpoints } from './verify/endpoints'

const args = process.argv.slice(2)

const USAGE = `
Usage: opencrvs <command>

Commands:
  environment            Manage deployment environments
  upgrade                Upgrade an existing environment
  check-translations     Check translation files for completeness
  verify-endpoints       Verify the locally-running country config exposes the
                         expected endpoints and keeps secured ones locked down

Run 'opencrvs <command> --help' for more information on a command.
`.trim()

const VERIFY_ENDPOINTS_USAGE = `
Usage: opencrvs verify-endpoints [country-config-url]

Run this after 'opencrvs upgrade', with the upgraded country config running
locally, to confirm it still behaves correctly. It checks over HTTP that:
  - required public endpoints exist (respond 2xx), and
  - user-notification trigger endpoints are either absent or reject
    unauthenticated requests (never processed without a token).

Arguments:
  [country-config-url]   Optional. Domain or URL of the country config
                         service. Defaults to 'http://localhost:3040', the
                         port country config listens on locally. A bare
                         domain is assumed to use https.

Options:
  -h, --help             Show this message.

Exits with a non-zero status if any check fails.
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
    case 'verify-endpoints':
      return handleVerifyEndpoints()
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
  upgrade           Upgrade existing environment configuration
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
    case 'upgrade':
      return runEnvironmentCommand('environment upgrade', runEnvironmentUpgrade)
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

const CHECK_TRANSLATIONS_USAGE = `
Usage: opencrvs check-translations [options]

Check that every message this country config declares has a row in
src/translations/countryconfig.csv.

Options:
  --write       Add the missing rows, filling in English only
  --outdated    List rows nothing in the source declares any more
  -h, --help    Show this help
`

function handleCheckTranslations() {
  const checkArgs = args.slice(1)

  if (checkArgs.includes('--help') || checkArgs.includes('-h')) {
    console.log(CHECK_TRANSLATIONS_USAGE)
    return
  }

  /*
   * Only options are inspected. This runs from lint-staged, which appends the
   * staged filenames to the command, and the check always covers the whole
   * package rather than a file list.
   */
  const unknownFlags = checkArgs.filter(
    (arg) => arg.startsWith('-') && !['--write', '--outdated'].includes(arg)
  )

  if (unknownFlags.length > 0) {
    console.error(`Unknown option: ${unknownFlags.join(', ')}\n`)
    console.log(CHECK_TRANSLATIONS_USAGE)
    process.exit(1)
  }

  const cwd = process.cwd()
  const { missing, outdated, dynamicIds } = check(cwd)

  for (const file of dynamicIds) {
    console.warn(
      `Warning: ${file} declares a message whose id is built at runtime. Ids have to be hardcoded to be checked.`
    )
  }

  if (checkArgs.includes('--outdated')) {
    console.log(
      `${outdated.length} row(s) in countryconfig.csv are not declared in src:\n`
    )
    console.log(outdated.join('\n'))
    return
  }

  if (missing.length === 0) {
    console.log('Every message declared in src has a translation row.')
    return
  }

  console.error(
    `${missing.length} message(s) declared in src have no row in src/translations/countryconfig.csv:\n`
  )
  console.error(missing.map(({ id }) => `  ${id}`).join('\n'))

  if (!checkArgs.includes('--write')) {
    console.error(
      '\nRun `pnpm extract:translations --write` to add them with their English copy.'
    )
    process.exit(1)
  }

  const added = writeMissing(cwd, missing)
  console.log(`\nAdded ${added.length} row(s) to countryconfig.csv.`)
  console.log('The languages other than English are still yours to write.')
}

async function handleVerifyEndpoints() {
  const verifyArgs = args.slice(1)

  if (verifyArgs.includes('--help') || verifyArgs.includes('-h')) {
    console.log(VERIFY_ENDPOINTS_USAGE)
    process.exit(0)
  }

  const positional = verifyArgs.filter((arg) => !arg.startsWith('-'))

  if (positional.length > 1) {
    console.error(
      `Unexpected extra argument(s): ${positional.slice(1).join(', ')}\n`
    )
    console.log(VERIFY_ENDPOINTS_USAGE)
    process.exit(1)
  }

  try {
    // Defaults to http://localhost:3040 when no target is given.
    await runVerifyEndpoints(positional[0])
  } catch (error) {
    console.error(
      'Endpoint verification failed:',
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

main()
