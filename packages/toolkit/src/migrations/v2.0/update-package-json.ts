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
 * Codemod: Update root `package.json` for the v1.9 → v2.0 upgrade.
 *
 * Changes applied:
 *   1. Sets `version` to `2.0.0`.
 *   2. Sets `zod` to `^4.2.1` in `dependencies` (or `devDependencies` if it
 *      already lives there). If `zod` is absent from both, it's added to
 *      `dependencies`.
 *
 * Caveats:
 *   - The codemod preserves the file's existing 2-space indentation and
 *     trailing newline. Any non-standard formatting (e.g. tabs) will be
 *     replaced with 2-space indentation.
 *   - No-op when `package.json` is missing.
 *   - No automatic `yarn install` is run; the developer should reinstall
 *     dependencies after the codemods complete.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const PACKAGE_JSON_RELATIVE = 'package.json'
const TARGET_VERSION = '2.0.0'
const TARGET_ZOD_RANGE = '^4.2.1'

type PackageJson = {
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

async function main(): Promise<void> {
  const packageJsonPath = path.join(process.cwd(), PACKAGE_JSON_RELATIVE)

  if (!existsSync(packageJsonPath)) {
    console.log(`'${PACKAGE_JSON_RELATIVE}' not found in ${process.cwd()} — skipping.`)
    return
  }

  const raw = readFileSync(packageJsonPath, 'utf8')

  let parsed: PackageJson
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.warn(
      `  [${PACKAGE_JSON_RELATIVE}] Failed to parse JSON — skipping update. ${(error as Error).message}`
    )
    return
  }

  console.log(`Updating '${PACKAGE_JSON_RELATIVE}'...`)

  const previousVersion = parsed.version
  const versionChanged = previousVersion !== TARGET_VERSION
  parsed.version = TARGET_VERSION

  if (versionChanged) {
    console.log(
      `  Set version: ${previousVersion ?? '<unset>'} → ${TARGET_VERSION}`
    )
  } else {
    console.log(`  Version already ${TARGET_VERSION} — no change.`)
  }

  // Resolve which dependency bucket already holds zod, defaulting to
  // `dependencies` when absent.
  let zodBucket: 'dependencies' | 'devDependencies' = 'dependencies'
  if (parsed.devDependencies && 'zod' in parsed.devDependencies) {
    zodBucket = 'devDependencies'
  }

  if (!parsed[zodBucket]) {
    parsed[zodBucket] = {}
  }

  const bucket = parsed[zodBucket] as Record<string, string>
  const previousZod = bucket.zod
  const zodChanged = previousZod !== TARGET_ZOD_RANGE
  bucket.zod = TARGET_ZOD_RANGE

  if (zodChanged) {
    console.log(
      `  Set ${zodBucket}.zod: ${previousZod ?? '<absent>'} → ${TARGET_ZOD_RANGE}`
    )
  } else {
    console.log(`  ${zodBucket}.zod already ${TARGET_ZOD_RANGE} — no change.`)
  }

  // Preserve trailing newline if the source had one (default to LF since
  // most repos commit JSON with a trailing newline).
  const trailingNewline = raw.endsWith('\n') ? '\n' : ''
  const next = JSON.stringify(parsed, null, 2) + trailingNewline

  if (next === raw) {
    console.log('\n  No changes to write.')
    return
  }

  writeFileSync(packageJsonPath, next, 'utf8')
  console.log(`\n  Saved '${PACKAGE_JSON_RELATIVE}'.`)
  console.log(
    `  NOTE: run \`yarn install\` (or your package manager equivalent) to install the updated dependency versions.`
  )
}

export { main }
