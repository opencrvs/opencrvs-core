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

// Keeps @opencrvs/components a single entry point. See
// docs/adr/0004-components-single-entry-point.md before changing ENTRY_POINTS.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ENTRY_POINTS = {
  '.': './src/index.ts',
  './icons': './src/icons/index.ts',
  './legacy': './src/buttons/index.ts'
}

const root = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const rootIndex = readFileSync(join(root, 'src/index.ts'), 'utf8')
const groupFolders = Object.entries(ENTRY_POINTS)
  .filter(([key]) => key !== '.')
  .map(([, target]) => target.split('/')[2])

const problems = []

if (JSON.stringify(pkg.exports) !== JSON.stringify(ENTRY_POINTS)) {
  problems.push(
    `package.json "exports" must be exactly ${JSON.stringify(ENTRY_POINTS)}. ` +
      'Export new modules from src/index.ts instead of adding a subpath.'
  )
}

if (pkg.sideEffects !== false) {
  problems.push('package.json must set "sideEffects": false.')
}

for (const entry of readdirSync(join(root, 'src'), { withFileTypes: true })) {
  const name = entry.name
  if (entry.isFile()) {
    if (name !== 'index.ts') {
      problems.push(`src/${name} sits outside a folder. Move it into one.`)
    }
    continue
  }
  if (!existsSync(join(root, 'src', name, 'index.ts'))) {
    problems.push(`src/${name} has no index.ts, its public surface.`)
  }
  const reExported = new RegExp(`^export \\* from '\\./${name}'$`, 'm').test(
    rootIndex
  )
  if (!reExported && !groupFolders.includes(name)) {
    problems.push(
      `src/${name} is not re-exported from src/index.ts, so no consumer can reach it.`
    )
  }
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'))
  process.exitCode = 1
}
