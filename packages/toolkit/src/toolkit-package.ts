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
import { existsSync, readFileSync } from 'fs'
import path from 'path'

/**
 * Returns the directory of the toolkit's `package.json`. The bundler can put
 * the code that calls this function in any file under `dist/`, so the function
 * searches up from this module instead of a fixed number of levels.
 */
export function getToolkitRoot(): string {
  let directory = __dirname
  while (!existsSync(path.join(directory, 'package.json'))) {
    const parent = path.dirname(directory)
    if (parent === directory) {
      throw new Error(
        `Cannot find the toolkit's package.json above ${__dirname}`
      )
    }
    directory = parent
  }
  return directory
}

/** Returns the toolkit's own version, e.g. `2.2.0`. */
export function getToolkitVersion(): string {
  const packageJson = JSON.parse(
    readFileSync(path.join(getToolkitRoot(), 'package.json'), 'utf-8')
  )
  return packageJson.version
}
