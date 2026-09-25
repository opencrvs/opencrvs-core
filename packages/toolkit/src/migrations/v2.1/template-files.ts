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
 * Country config template files bundled into the toolkit by `build.sh`, shared
 * by the codemods that copy them into a country config.
 */

import { existsSync, readdirSync } from 'fs'
import path from 'path'

/**
 * Where the bundled template files are: next to the built CLI in `dist/`, or
 * the template package itself when running from source (tests, ts-node).
 */
export function findTemplateDir() {
  const candidates = [
    path.resolve(__dirname, 'templates', 'countryconfig-template'),
    path.resolve(__dirname, '../../../../countryconfig-template')
  ]

  const templateDir = candidates.find((candidate) =>
    existsSync(path.join(candidate, 'Tiltfile'))
  )

  if (!templateDir) {
    throw new Error(
      `Country config template files not found in any of: ${candidates.join(', ')}`
    )
  }

  return templateDir
}

/** Every file under `dir`, relative to `root`, with forward slashes. */
export function listFiles(root: string, dir: string): string[] {
  const absolute = path.join(root, dir)

  if (!existsSync(absolute)) {
    return []
  }

  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(root, relative) : [relative]
  })
}
