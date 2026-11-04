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
// Builds the published package: a CommonJS entry per public subpath and CLI,
// sharing chunks between them, and the subpaths' declarations. The private
// workspace packages (@opencrvs/commons, @opencrvs/events) are inlined from
// their source; every other package stays an import, so it has to be a
// dependency a consumer installs with the toolkit.
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

// One entry per subpath in the package.json `exports`: ./dist/api/index.js -> src/api/index.ts
const subpaths = Object.values(pkg.exports).map((file) =>
  file.replace(/^\.\/dist\//, 'src/').replace(/\.js$/, '.ts')
)

const scripts = ['src/cli.ts', 'src/migrations/index.ts']

const external = (id) => /^[@\w]/.test(id) && !WORKSPACE.test(id)

// src/api/index.ts -> api/index
const outName = (file) => path.relative('src', file).replace(/\.ts$/, '')

const scriptNames = new Set(scripts.map(outName))

/**
 * Fails the build when a module that reads files next to itself through
 * `__dirname` lands outside dist/, where those files are copied.
 */
const dirnameAtRoot = {
  name: 'dirname-at-root',
  generateBundle(_, bundle) {
    const modules = ['src/cli.ts', 'src/environment/templates.ts'].map((file) =>
      path.join(import.meta.dirname, file)
    )
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== 'chunk' || !chunk.fileName.includes('/')) continue
      const moduleId = modules.find((id) => chunk.moduleIds.includes(id))
      if (!moduleId) continue
      this.error(
        `${chunk.fileName} contains ${path.relative(import.meta.dirname, moduleId)}, which resolves files from __dirname, so it must be emitted directly in dist/`
      )
    }
  }
}

export default defineConfig([
  {
    input: Object.fromEntries(
      [...subpaths, ...scripts].map((file) => [outName(file), file])
    ),
    external,
    platform: 'node',
    plugins: [dirnameAtRoot],
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].js',
      // Directly in dist/, see dirnameAtRoot
      chunkFileNames: '[name]-[hash].js',
      banner: (chunk) =>
        chunk.isEntry && scriptNames.has(chunk.name)
          ? '#!/usr/bin/env node'
          : ''
    }
  },
  {
    input: subpaths,
    external,
    plugins: [
      dts({ tsconfig: '../tsconfig.toolkit-types.json', emitDtsOnly: true }),
      dependenciesOnly
    ],
    output: {
      dir: 'dist',
      // Next to the entry's JavaScript: src/api/index.ts -> dist/api/index.d.ts
      entryFileNames: (chunk) =>
        path.relative(
          path.join(import.meta.dirname, 'src'),
          chunk.facadeModuleId
        ),
      chunkFileNames: 'types/[name]-[hash].js'
    }
  }
])
