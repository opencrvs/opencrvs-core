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
 * require('typescript') at runtime and need the TypeScript 6 API. Their
 * `typescript` peer dependency (which would resolve to the workspace TS 7)
 * is turned into a real dependency on TS 6. pnpm installs one shared
 * typescript@6.0.3 in the store, so they all get the same module instance.
 *
 * (The TS 6 tsc/tsserver bins that pnpm links into client/login — they
 * depend on the `@typescript/api` alias directly — are cleaned up by
 * development-environment/link-ts6-api.js from the root postinstall.)
 *
 * When TypeScript 7.1 ships its API, delete this file, the consumers can
 * resolve the root `typescript` again.
 */

const TS6 = 'npm:typescript@6.0.3'

const TS6_API_CONSUMERS = new Set([
  // The umbrella package, used by packages/mosip-api's flat config. Core's own
  // packages depend on the scoped packages below directly.
  'typescript-eslint',
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/type-utils',
  '@typescript-eslint/utils',
  '@typescript-eslint/typescript-estree',
  'ts-api-utils',
  'react-docgen-typescript',
  '@joshwooding/vite-plugin-react-docgen-typescript'
])

function readPackage(pkg) {
  /*
   * @types/hapi__hapi are the DefinitelyTyped types for hapi v20 — the
   * workspace runs @hapi/hapi v21, which ships its own types. Packages that
   * still depend on the v20 types (hapi-pino, @types/hapi__h2o2, …) would
   * resolve `import '@hapi/hapi'` to that stale copy under pnpm's strict
   * layout, so their module augmentations (server.logger, h.proxy, …) would
   * land on a different module than the real @hapi/hapi and never merge.
   * Dropping the dependency makes them fall through to the real package.
   */
  if (pkg.dependencies?.['@types/hapi__hapi']) {
    delete pkg.dependencies['@types/hapi__hapi']
  }

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
