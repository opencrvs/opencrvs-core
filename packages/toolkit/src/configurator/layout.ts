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

import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmdirSync
} from 'node:fs'
import { basename, dirname, join } from 'node:path'
import {
  OLD_INVENTORY_DIR,
  environmentInventoryPath,
  isDirectory
} from './paths'

export interface InventoryMove {
  environment: string
  /** Relative to the repository root. */
  from: string
  /** Relative to the repository root. */
  to: string
}

export interface LayoutMigration {
  moved: InventoryMove[]
  /** Left where they are: the environment already has an inventory. */
  skipped: InventoryMove[]
  /** The old inventory directory is gone. False when nothing was found, or when it still holds files. */
  oldDirectoryRemoved: boolean
}

/** Inventories in the old location, relative to `root`, in alphabetical order. */
export function findOldInventoryFiles(root: string): string[] {
  const directory = join(root, OLD_INVENTORY_DIR)
  if (!isDirectory(directory)) return []

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.yml'))
    .map((entry) => join(OLD_INVENTORY_DIR, entry.name))
    .sort()
}

/**
 * Moves `infrastructure/server-setup/inventory/<name>.yml` to
 * `environments/<name>/inventory.yml`. An inventory is never overwritten: when
 * the destination exists the old file stays and is reported as skipped.
 */
export function migrateLayout(root: string): LayoutMigration {
  const oldFiles = findOldInventoryFiles(root)
  const result: LayoutMigration = {
    moved: [],
    skipped: [],
    oldDirectoryRemoved: false
  }
  if (oldFiles.length === 0) return result

  for (const from of oldFiles) {
    const environment = basename(from, '.yml')
    const move = {
      environment,
      from,
      to: environmentInventoryPath(environment)
    }

    if (existsSync(join(root, move.to))) {
      result.skipped.push(move)
      continue
    }

    mkdirSync(dirname(join(root, move.to)), { recursive: true })
    renameSync(join(root, move.from), join(root, move.to))
    result.moved.push(move)
  }

  const oldDirectory = join(root, OLD_INVENTORY_DIR)
  try {
    if (readdirSync(oldDirectory).length === 0) {
      rmdirSync(oldDirectory)
      result.oldDirectoryRemoved = true
    }
  } catch {
    // Not removable (permissions, a race): it is left for the user, and reported as still there.
  }

  return result
}

/**
 * Throws while inventories are still in the old location: `init` writes to
 * `environments/<name>/inventory.yml`, so it would create a second inventory.
 */
export function assertNoOldInventoryLayout(root: string) {
  if (findOldInventoryFiles(root).length === 0) return

  throw new Error(
    `Old inventory layout detected at ${OLD_INVENTORY_DIR}. Please run \`opencrvs configurator upgrade\` before \`opencrvs configurator init\`.`
  )
}
