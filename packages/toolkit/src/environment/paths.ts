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

import { basename, join } from 'path'
import * as glob from 'glob'

export const OLD_INVENTORY_DIR = join(
  'infrastructure',
  'server-setup',
  'inventory'
)

export const INVENTORY_FILE_NAME = 'inventory.yml'

export function getEnvironmentInventoryPath(environment: string) {
  return join('environments', environment, INVENTORY_FILE_NAME)
}

export function findOldInventoryFiles() {
  return glob.sync(join(OLD_INVENTORY_DIR, '*.yml')).sort()
}

export function getEnvironmentNameFromOldInventoryPath(filePath: string) {
  return basename(filePath, '.yml')
}

export function assertNoOldInventoryLayout() {
  if (findOldInventoryFiles().length === 0) {
    return
  }

  throw new Error(
    [
      `Old inventory layout detected at ${OLD_INVENTORY_DIR}.`,
      'Please run `yarn environment:upgrade` before running `yarn environment:init`.'
    ].join(' ')
  )
}
