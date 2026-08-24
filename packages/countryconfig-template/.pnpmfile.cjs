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
 * A country config is its own pnpm project — it is deliberately excluded from
 * opencrvs-core's workspace and installed with `--ignore-workspace` — so the
 * root .pnpmfile.cjs does not apply to it, and the fixup it makes for the
 * TypeScript 6 API is repeated here.
 *
 * `typescript` is the native TypeScript 7 compiler, which ships no programmatic
 * API until TS 7.1. The packages below require('typescript') at runtime and
 * need the TypeScript 6 API, so their `typescript` peer dependency is turned
 * into a real dependency on TS 6. Without this, typescript-eslint loads TS 7
 * and crashes reading its AST.
 *
 * When TypeScript 7.1 ships its API, this file can go.
 */

const TS6 = 'npm:typescript@6.0.3'

const TS6_API_CONSUMERS = new Set([
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/type-utils',
  '@typescript-eslint/utils',
  '@typescript-eslint/typescript-estree',
  'ts-api-utils'
])

function readPackage(pkg) {
  if (TS6_API_CONSUMERS.has(pkg.name) && pkg.peerDependencies?.typescript) {
    delete pkg.peerDependencies.typescript
    if (pkg.peerDependenciesMeta) {
      delete pkg.peerDependenciesMeta.typescript
    }
    pkg.dependencies = { ...pkg.dependencies, typescript: TS6 }
  }

  return pkg
}

module.exports = { hooks: { readPackage } }
