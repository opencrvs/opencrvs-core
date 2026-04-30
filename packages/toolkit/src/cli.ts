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

const args = process.argv.slice(2)

const USAGE = `
Usage: opencrvs <command>

Commands:
  environment init       Initialise a new environment
  upgrade                Upgrade an existing environment
  check-translations     Check translation files for completeness

Run 'opencrvs <command> --help' for more information on a command.
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
  console.log('Initiating upgrade...')
  try {
    const pathToCountryconfig: string | undefined = args[1]
    await runUpgrade(pathToCountryconfig)
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
