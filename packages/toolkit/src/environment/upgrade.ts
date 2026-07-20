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
} from 'fs'
import { dirname } from 'path'
import kleur from 'kleur'
import { log, success, warn } from './logger'
import {
  OLD_INVENTORY_DIR,
  findOldInventoryFiles,
  getEnvironmentInventoryPath,
  getEnvironmentNameFromOldInventoryPath
} from './paths'
import { updateWorkflowEnvironments } from './update-workflows'

function moveFileIfDestinationMissing(sourcePath: string, destinationPath: string) {
  if (!existsSync(sourcePath)) {
    return false
  }

  if (existsSync(destinationPath)) {
    warn(
      `⚠️  Skipped ${sourcePath}; destination already exists at ${destinationPath}`
    )
    return false
  }

  mkdirSync(dirname(destinationPath), { recursive: true })
  renameSync(sourcePath, destinationPath)
  log(`  ✓ Moved ${sourcePath} -> ${destinationPath}`)
  return true
}

function migrateInventoryFiles() {
  const oldInventoryFiles = findOldInventoryFiles()

  if (oldInventoryFiles.length === 0) {
    log(`ℹ️  No old inventory files found at ${OLD_INVENTORY_DIR}`)
    return false
  }

  log(kleur.bold('\nMigrating Ansible inventory files'))
  let didMoveInventory = false

  for (const oldInventoryFile of oldInventoryFiles) {
    const environment = getEnvironmentNameFromOldInventoryPath(oldInventoryFile)
    didMoveInventory =
      moveFileIfDestinationMissing(
        oldInventoryFile,
        getEnvironmentInventoryPath(environment)
      ) || didMoveInventory
  }

  try {
    if (
      existsSync(OLD_INVENTORY_DIR) &&
      readdirSync(OLD_INVENTORY_DIR).length === 0
    ) {
      rmdirSync(OLD_INVENTORY_DIR)
      log(`  ✓ Removed empty ${OLD_INVENTORY_DIR}`)
    }
  } catch {
    warn(`⚠️  Could not remove ${OLD_INVENTORY_DIR}; please review it manually`)
  }

  return didMoveInventory
}

export async function upgradeEnvironmentLayout() {
  const didMoveInventory = migrateInventoryFiles()

  await updateWorkflowEnvironments()

  if (didMoveInventory) {
    success('\n✅ Environment layout upgrade completed successfully.')
  } else {
    success('\n✅ Environment layout already uses the current structure.')
  }

  log('\nCommit changes into git after upgrade')
}
