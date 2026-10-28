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
// Emits the published type surface: one declaration file per public subpath.
// Types from the private workspace packages (@opencrvs/commons, @opencrvs/events)
// are inlined from their source; every other package stays an import, so it
// has to be a dependency a consumer installs with the toolkit.
import path from 'node:path'
import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'
import pkg from './package.json' with { type: 'json' }

const WORKSPACE = /^@opencrvs\/(commons|events)(\/|$)|^@events\//

const packageName = (id) =>
  id
    .split('/')
    .slice(0, id.startsWith('@') ? 2 : 1)
    .join('/')

/** Fails the build when an emitted declaration imports a package the toolkit does not depend on. */
const dependenciesOnly = {
  name: 'dependencies-only',
  generateBundle(_, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== 'chunk') continue
      // `chunk.imports` also lists externals whose imports were tree-shaken away
      const specifiers = chunk.code.matchAll(
        /(?:from |import\()"([^".][^"]*)"/g
      )
      for (const [, id] of specifiers) {
        if (packageName(id) in pkg.dependencies) continue
        this.error(
          `${chunk.fileName} imports '${id}', which is not in the toolkit's dependencies`
        )
      }
    }
  }
}

export default defineConfig({
  // One per subpath in the package.json `exports`.
  input: [
    'src/api/index.ts',
    'src/application-config/index.ts',
    'src/authentication/index.ts',
    'src/conditionals/index.ts',
    'src/events/index.ts',
    'src/events/deduplication.ts',
    'src/notification/index.ts',
    'src/scopes/index.ts',
    'src/telemetry/index.ts'
  ],
  external: (id) => /^[@\w]/.test(id) && !WORKSPACE.test(id),
  plugins: [
    dts({ tsconfig: '../tsconfig.toolkit-types.json', emitDtsOnly: true }),
    dependenciesOnly
  ],
  output: {
    dir: 'dist',
    // Next to the JS that esbuild emits for the same entry: src/api/index.ts -> dist/api/index.d.ts
    entryFileNames: (chunk) =>
      path.relative(
        path.join(import.meta.dirname, 'src'),
        chunk.facadeModuleId
      ),
    chunkFileNames: 'types/[name]-[hash].js'
  }
})
