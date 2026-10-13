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

/**
 * Upgrade step: Point the country config's `@opencrvs/toolkit` dependency at
 * the toolkit running the upgrade.
 *
 * Why:
 *   The upgrade checks which version it upgrades from by the toolkit version
 *   the country config depends on. Updating it here, rather than by hand before
 *   upgrading, keeps that version the one the country config was on until its
 *   steps have run.
 *
 * What it does:
 *   - Rewrites the version of `@opencrvs/toolkit` in `package.json`, keeping a
 *     `^` or `~` in front of it and the rest of the file as written
 *   - Leaves a version without a major.minor alone, as in `workspace:*`
 */

import fs from 'fs'
import path from 'path'
import { findMajorMinor, TOOLKIT_PACKAGE_NAME } from './check-upgrade-path'

const DEPENDENCY_PATTERN = new RegExp(
  `("${TOOLKIT_PACKAGE_NAME}"\\s*:\\s*")([^"]*)(")`,
  'g'
)

/**
 * Returns the `package.json` text with its toolkit dependency set to the
 * version, or undefined when there is nothing to update.
 */
export function updateToolkitDependency(
  packageJson: string,
  toolkitVersion: string
): string | undefined {
  const updated = packageJson.replace(
    DEPENDENCY_PATTERN,
    (match, before: string, version: string, after: string) => {
      if (!findMajorMinor(version)) {
        return match
      }

      const range = /^[\^~]?/.exec(version)?.[0] ?? ''

      return `${before}${range}${toolkitVersion}${after}`
    }
  )

  return updated === packageJson ? undefined : updated
}

export async function main(toolkitVersion: string) {
  const packageJsonPath = path.join(process.cwd(), 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`No package.json found. Skipping ${TOOLKIT_PACKAGE_NAME}.`)
    return
  }

  const updated = updateToolkitDependency(
    fs.readFileSync(packageJsonPath, 'utf-8'),
    toolkitVersion
  )

  if (!updated) {
    console.log(
      `${TOOLKIT_PACKAGE_NAME} in package.json needs no update. Nothing to do.`
    )
    return
  }

  fs.writeFileSync(packageJsonPath, updated)
  console.log(
    `Updated ${TOOLKIT_PACKAGE_NAME} to ${toolkitVersion} in package.json. Install the dependencies again to use it.`
  )
}
