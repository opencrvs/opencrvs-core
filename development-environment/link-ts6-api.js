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
 * which ships no programmatic API until TS 7.1. Packages that
 * require('typescript') at runtime (typescript-eslint, ts-api-utils,
 * react-docgen-typescript, …) get the TypeScript 6 API via .pnpmfile.cjs,
 * which turns their `typescript` peer dependency into a real dependency on
 * the TS 6 API package.
 *
 * What remains here: client and login depend on the `@typescript/api` alias
 * directly (extract-translations), so pnpm links the TS 6 `tsc`/`tsserver`
 * bins into their package-local node_modules/.bin, where they shadow the
 * workspace-root native TS 7 compiler on script PATHs. Remove them so bare
 * `tsc` in package scripts falls through to the root .bin (TS 7). Runs from
 * the root `postinstall`.
 *
 * When TypeScript 7.1 ships its API, delete this script and .pnpmfile.cjs,
 * the consumers can resolve the root `typescript` again.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

if (!fs.existsSync(path.join(ROOT, 'node_modules', 'typescript'))) {
  // typescript is a devDependency: absent from a production install
  // (Docker images), where there is no TypeScript toolchain and nothing
  // to do.
  console.log('link-ts6-api: production install, no TypeScript to fix up')
  process.exit(0)
}

for (const pkg of fs.readdirSync(path.join(ROOT, 'packages'))) {
  for (const bin of ['tsc', 'tsserver']) {
    const local = path.join(ROOT, 'packages', pkg, 'node_modules', '.bin', bin)
    if (fs.existsSync(local)) {
      fs.rmSync(local)
      console.log(`link-ts6-api: removed packages/${pkg} local .bin/${bin}`)
    }
  }
}
