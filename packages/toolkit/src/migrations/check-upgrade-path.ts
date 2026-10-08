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
 * Checks that a country config is upgraded one minor version at a time, as the
 * documentation recommends. The toolkit only carries the steps from the
 * previous minor to its own, so upgrading from further back would silently skip
 * the steps of the versions in between.
 */

import fs from 'fs'
import path from 'path'

const TOOLKIT_PACKAGE_NAME = '@opencrvs/toolkit'

interface MajorMinor {
  major: number
  minor: number
}

export type UpgradePathCheck =
  | { status: 'ok' }
  | { status: 'unknown'; message: string }
  | { status: 'blocked'; message: string }

/**
 * Reads the major.minor out of a version or a version range, e.g. `2.1` out of
 * `2.1.0`, `^2.1.3` or `2.2.0-rc.1`. Returns undefined when there is none, as
 * in `workspace:*` or `latest`.
 */
export function findMajorMinor(version: string): MajorMinor | undefined {
  const match = /(\d+)\.(\d+)/.exec(version)

  return match
    ? { major: Number(match[1]), minor: Number(match[2]) }
    : undefined
}

function format({ major, minor }: MajorMinor) {
  return `${major}.${minor}`
}

/**
 * Returns the `@opencrvs/toolkit` version the country config in the directory
 * depends on, as written in its `package.json`, or undefined when it has none.
 */
export function findCountryConfigToolkitVersion(
  cwd: string
): string | undefined {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8')
    )

    return (
      packageJson.dependencies?.[TOOLKIT_PACKAGE_NAME] ??
      packageJson.devDependencies?.[TOOLKIT_PACKAGE_NAME]
    )
  } catch {
    return undefined
  }
}

/**
 * Checks that the country config is on the minor version before the toolkit's,
 * or already on the toolkit's: the steps are idempotent, so running them again
 * after a patch release is safe.
 *
 * @param countryConfigToolkitVersion the toolkit version the country config depends on.
 * @param toolkitVersion the version of the toolkit running the upgrade.
 */
export function checkUpgradePath(
  countryConfigToolkitVersion: string | undefined,
  toolkitVersion: string
): UpgradePathCheck {
  const target = findMajorMinor(toolkitVersion)
  const current = countryConfigToolkitVersion
    ? findMajorMinor(countryConfigToolkitVersion)
    : undefined

  if (!target || !current) {
    return {
      status: 'unknown',
      message: `Could not tell which version the country config is on from its ${TOOLKIT_PACKAGE_NAME} dependency (${countryConfigToolkitVersion ?? 'not found'}). Make sure it is on the version before ${toolkitVersion}: upgrade one minor version at a time.`
    }
  }

  const isSameVersion =
    current.major === target.major && current.minor === target.minor
  const isPreviousMinor =
    current.major === target.major && current.minor === target.minor - 1
  // Which minor a major ends on is not known here, so any minor of the
  // previous major is let through to the next major's x.0
  const isPreviousMajor =
    target.minor === 0 && current.major === target.major - 1

  if (isSameVersion || isPreviousMinor || isPreviousMajor) {
    return { status: 'ok' }
  }

  const isNewer =
    current.major > target.major ||
    (current.major === target.major && current.minor > target.minor)

  if (isNewer) {
    return {
      status: 'blocked',
      message: `The country config is already on ${format(current)}, newer than toolkit ${toolkitVersion}. Run the upgrade with the toolkit of the version you are upgrading to.`
    }
  }

  const next = { major: current.major, minor: current.minor + 1 }
  const upgradesFrom =
    target.minor > 0
      ? format({ major: target.major, minor: target.minor - 1 })
      : `the last ${target.major - 1}.x`

  return {
    status: 'blocked',
    message: `The country config is on ${format(current)}, but toolkit ${toolkitVersion} only upgrades from ${upgradesFrom}. Upgrade one minor version at a time: run \`npx ${TOOLKIT_PACKAGE_NAME}@${format(next)} upgrade\` first.`
  }
}
