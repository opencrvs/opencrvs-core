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

// `node-pg-migrate create` always turns spaces and underscores into dashes, so
// this calls its Migration.create directly to name new files foo_bar_baz.
import { resolve } from 'node:path'
import { Migration } from 'node-pg-migrate'
import config from './node-pg-migrate.json' with { type: 'json' }

const name = process.argv
  .slice(2)
  .join('_')
  .replace(/[\s-]+/g, '_')

if (!name) {
  console.error('Usage: pnpm create:events <migration_name>')
  process.exit(1)
}

const migrationPath = await Migration.create(
  name,
  resolve(import.meta.dirname, config['migrations-dir']),
  { language: config['migration-file-language'] }
)

console.log(`Created migration -- ${migrationPath}`)
