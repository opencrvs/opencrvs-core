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

/*
 * The workspace `typescript` dependency is the native TypeScript 7 compiler,
 * which ships no programmatic API until TS 7.1. The packages listed below
 * require('typescript') at runtime and need the TypeScript 6 API, installed
 * here under the `@typescript/api` npm alias. Node resolves `typescript`
 * by walking up the directory tree, so a symlink placed inside each consumer
 * shadows the workspace-root TypeScript 7 without affecting anything else.
 *
 * When TypeScript 7.1 ships its API, delete this script, the consumers can
 * resolve the root `typescript` again. Runs from the root `postinstall`.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const TS6 = path.join(ROOT, 'node_modules', '@typescript', 'api')

// Every hoisted package that require()s the TypeScript API.
// '@typescript-eslint' covers the whole scope: Node's resolution walks
// through node_modules/@typescript-eslint/node_modules for all its packages.
const CONSUMERS = [
  '@typescript-eslint', // typescript-estree, type-utils… (ESLint type-aware rules)
  'ts-api-utils', // used by typescript-eslint rules
  'react-docgen-typescript', // Storybook docgen (components build-storybook)
  '@joshwooding/vite-plugin-react-docgen-typescript' // wires docgen into Storybook's vite build
]

if (!fs.existsSync(TS6)) {
  console.error(
    'link-ts6-api: @typescript/api is not installed, run yarn install'
  )
  process.exit(1)
}

// Both `typescript` (TS 7) and the `@typescript/api` alias (TS 6) declare a
// `tsc` bin, and yarn links whichever it happens to install first. Everything
// on PATH must be the native compiler — force the workspace .bin entries.
const BIN = path.join(ROOT, 'node_modules', '.bin')
fs.rmSync(path.join(BIN, 'tsc'), { force: true })
fs.symlinkSync('../typescript/bin/tsc', path.join(BIN, 'tsc'))
// tsserver only exists in TS 6 — remove it from PATH so nothing silently
// picks up the TS 6 toolchain; editors use the native LSP extension instead.
fs.rmSync(path.join(BIN, 'tsserver'), { force: true })
console.log('link-ts6-api: .bin/tsc → typescript@7 (native)')

// Packages that depend on @typescript/api directly (extract-translations)
// get a package-local .bin/tsc pointing at TS 6 — remove it so their
// `tsc` scripts fall through to the workspace-root native compiler.
for (const pkg of fs.readdirSync(path.join(ROOT, 'packages'))) {
  for (const bin of ['tsc', 'tsserver']) {
    const local = path.join(ROOT, 'packages', pkg, 'node_modules', '.bin', bin)
    if (fs.existsSync(local)) {
      fs.rmSync(local)
      console.log(`link-ts6-api: removed packages/${pkg} local .bin/${bin}`)
    }
  }
}

for (const consumer of CONSUMERS) {
  const consumerDir = path.join(ROOT, 'node_modules', consumer)
  if (!fs.existsSync(consumerDir)) {
    console.warn(`link-ts6-api: ${consumer} not found, skipping`)
    continue
  }
  const nested = path.join(consumerDir, 'node_modules')
  const link = path.join(nested, 'typescript')
  fs.mkdirSync(nested, { recursive: true })
  fs.rmSync(link, { recursive: true, force: true })
  fs.symlinkSync(path.relative(nested, TS6), link, 'dir')
  console.log(`link-ts6-api: ${consumer} → typescript@6 (API)`)
}
