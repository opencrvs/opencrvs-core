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
 * Every `@opencrvs/components` specifier the repo imports must resolve through
 * the `exports` map. Node's resolver follows the `exports` spec strictly (no
 * extension or `index` inference, no array fallback past a missing file), so a
 * map that only works through one tool's leniency fails here, as it would in
 * eslint-import-resolver-typescript.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const componentsDir = path.dirname(fileURLToPath(import.meta.url))
const packagesDir = path.dirname(componentsDir)
const skippedDirs = new Set([
  'node_modules',
  'build',
  'dist',
  'lib',
  'coverage',
  'storybook-static'
])
const sourceFile = /\.(ts|tsx|js|jsx|mjs|mdx)$/
const specifier = /['"](@opencrvs\/components(?:\/[\w./-]+)?)['"]/g

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skippedDirs.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (sourceFile.test(entry.name)) yield full
  }
}

/** Components itself, and every package that declares it as a dependency. */
function consumerDirs() {
  return fs
    .readdirSync(packagesDir)
    .map((name) => path.join(packagesDir, name))
    .filter((dir) => {
      const manifest = path.join(dir, 'package.json')
      if (!fs.existsSync(manifest)) return false
      const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'))
      return (
        dir === componentsDir ||
        '@opencrvs/components' in
          { ...pkg.dependencies, ...pkg.devDependencies }
      )
    })
}

function importsByConsumer() {
  const found = []
  for (const consumerDir of consumerDirs()) {
    for (const file of walk(consumerDir)) {
      for (const [, spec] of fs.readFileSync(file, 'utf8').matchAll(specifier))
        found.push({ consumerDir, file, spec })
    }
  }
  return found
}

test('every imported @opencrvs/components specifier resolves to a source file', () => {
  const found = importsByConsumer()
  assert.ok(found.length > 0, 'no @opencrvs/components imports found')

  const unresolved = new Map()
  for (const { consumerDir, file, spec } of found) {
    const require = createRequire(path.join(consumerDir, 'package.json'))
    try {
      require.resolve(spec)
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error
      if (!unresolved.has(spec))
        unresolved.set(spec, path.relative(packagesDir, file))
    }
  }
  assert.deepEqual(
    [...unresolved].map(([spec, file]) => `${spec}  (e.g. ${file})`),
    [],
    'unresolved specifiers'
  )
})

test('every exports target exists', () => {
  const { exports } = JSON.parse(
    fs.readFileSync(path.join(componentsDir, 'package.json'), 'utf8')
  )
  const missing = Object.entries(exports)
    .filter(([key]) => !key.includes('*'))
    .filter(([, target]) => !fs.existsSync(path.join(componentsDir, target)))
  assert.deepEqual(missing, [])
})
