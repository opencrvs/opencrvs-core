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

import { statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** Where the Ansible inventories lived before environments got their own folder. */
export const OLD_INVENTORY_DIR = join(
  'infrastructure',
  'server-setup',
  'inventory'
)

export const ENVIRONMENTS_DIR = 'environments'
export const WORKFLOWS_DIR = join('.github', 'workflows')
export const INVENTORY_FILE_NAME = 'inventory.yml'

export function environmentInventoryPath(environment: string) {
  return join(ENVIRONMENTS_DIR, environment, INVENTORY_FILE_NAME)
}

export function isDirectory(path: string) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * Throws unless `root` looks like an OpenCRVS infrastructure repository: every
 * directory in `required` has to exist.
 */
export function assertInfrastructureRepository(
  root: string,
  required: readonly string[] = [
    WORKFLOWS_DIR,
    ENVIRONMENTS_DIR,
    'infrastructure'
  ]
) {
  const missing = required.filter(
    (directory) => !isDirectory(resolve(root, directory))
  )
  if (missing.length > 0) {
    throw new Error(
      `The current directory is not a valid OpenCRVS infrastructure repository. Missing required director${
        missing.length === 1 ? 'y' : 'ies'
      }: ${missing.join(', ')}`
    )
  }
}
