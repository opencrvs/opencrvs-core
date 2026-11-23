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
import { runVerifyEndpoints } from './verify/endpoints'

const args = process.argv.slice(2)

const USAGE = `
Usage: opencrvs <command>

Commands:
  environment init       Initialise a new environment
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

function handleEnvironment() {
  const subcommand = args[1]

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(
      `
Usage: opencrvs environment <subcommand>

Subcommands:
  init    Initialise a new environment
    `.trim()
    )
    process.exit(0)
  }

  switch (subcommand) {
    case 'init':
      console.log('Initialising environment...')
      console.warn('This command is not implemented yet!')
      process.exit(1)
      break
    default:
      console.error(`Unknown subcommand: environment ${subcommand}`)
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
