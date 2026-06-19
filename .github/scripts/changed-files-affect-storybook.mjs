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
 * Decide whether the changes in a PR can affect Storybook / Chromatic.
 *
 * Strategy: Storybook is built once per PR with `--webpack-stats-json`,
 * which produces `preview-stats.json` listing every module bundled into
 * Storybook. That set is the *exact* dependency graph of every story —
 * the same data Chromatic's TurboSnap consumes. We intersect that set
 * with `git diff --name-only <base>...HEAD`. If the intersection is
 * empty, no changed file ends up in any story, so Chromatic can be
 * skipped.
 *
 * Cross-package source mapping: workspace packages whose stats entries
 * point at compiled output (`@opencrvs/commons`, `@opencrvs/components`)
 * are mapped back to their source paths so that diffs against the
 * `src/` tree match. Packages whose imports the client resolves
 * directly to source via `tsconfigPaths` (e.g. `@gateway/*`,
 * `@events/*`) need no mapping — backend-only changes there will not
 * appear in stats because type-only imports get erased.
 *
 * Usage:
 *   node changed-files-affect-storybook.mjs \
 *     --stats <path/to/preview-stats.json> \
 *     --base <base-sha> \
 *     [--storybook-dir packages/client]
 *
 * Writes `affects=true|false` to $GITHUB_OUTPUT when set, and prints a
 * human-readable summary to stdout. Always exits 0.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

function parseArgs(argv) {
  const args = { storybookDir: 'packages/client' }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--stats') args.stats = argv[++i]
    else if (a === '--base') args.base = argv[++i]
    else if (a === '--storybook-dir') args.storybookDir = argv[++i]
  }
  if (!args.stats || !args.base) {
    console.error(
      'Usage: changed-files-affect-storybook.mjs --stats <file> --base <sha> [--storybook-dir <dir>]'
    )
    process.exit(2)
  }
  return args
}

const { stats: statsPath, base, storybookDir } = parseArgs(process.argv)
const repoRoot = process.cwd()

// 1. Parse webpack-style stats and collect repo-relative source paths.
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'))
const rawModules = stats.modules ?? []
const bundledFiles = new Set()

for (const mod of rawModules) {
  const raw = mod.name ?? mod.identifier ?? ''
  if (!raw) continue
  // Drop externals and virtual modules — they don't map to repo files.
  if (
    raw.startsWith('external ') ||
    raw.startsWith('webpack/') ||
    raw.startsWith('virtual:') ||
    raw.startsWith('\u0000') ||
    raw.includes('!')
  ) {
    continue
  }
  // Drop loader / query suffixes.
  let p = raw.split('?')[0]
  if (path.isAbsolute(p)) {
    if (!p.startsWith(repoRoot)) continue
    p = path.relative(repoRoot, p)
  } else {
    p = path.normalize(path.join(storybookDir, p))
  }
  if (p.includes('node_modules/')) continue
  if (!p.startsWith('packages/')) continue
  bundledFiles.add(p)
}

// 2. Map bundled compiled outputs back to their source files. Client
//    code resolves `@opencrvs/commons` and `@opencrvs/components` via
//    package.json exports → compiled dist, so stats reference build
//    artifacts, not source.
function mapToSourceCandidates(rel) {
  const out = []
  let m
  m = rel.match(
    /^packages\/commons\/build\/dist\/(?:common|esm)\/(.+)\.(?:js|d\.ts)$/
  )
  if (m) {
    const stem = m[1].replace(/\/index$/, '')
    out.push(
      `packages/commons/src/${stem}.ts`,
      `packages/commons/src/${stem}.tsx`,
      `packages/commons/src/${stem}/index.ts`,
      `packages/commons/src/${stem}/index.tsx`
    )
  }
  m = rel.match(/^packages\/components\/lib\/(.+)\.(?:js|d\.ts)$/)
  if (m) {
    const stem = m[1].replace(/\/index$/, '')
    out.push(
      `packages/components/src/${stem}.ts`,
      `packages/components/src/${stem}.tsx`,
      `packages/components/src/${stem}/index.ts`,
      `packages/components/src/${stem}/index.tsx`
    )
  }
  return out
}

const relevantFiles = new Set()
for (const f of bundledFiles) {
  relevantFiles.add(f)
  for (const c of mapToSourceCandidates(f)) relevantFiles.add(c)
}

// 3. Files that affect the Storybook build but won't necessarily appear
//    as bundled modules: storybook config, public assets, build/tsconfig
//    files, the gating script and workflow itself.
const alwaysRelevantFiles = new Set([
  'packages/client/vite.config.ts',
  'packages/client/tsconfig.base.json',
  'packages/client/tsconfig.build.json',
  'packages/client/package.json',
  'packages/client/chromatic.config.json',
  'packages/components/package.json',
  'packages/commons/package.json'
])
const alwaysRelevantPrefixes = [
  'packages/client/.storybook/',
  'packages/client/public/'
]

function isAlwaysRelevant(p) {
  if (alwaysRelevantFiles.has(p)) return true
  if (alwaysRelevantPrefixes.some((pref) => p.startsWith(pref))) return true
  // Story files and MDX docs anywhere in the client are always relevant
  // even if a brand-new story hasn't been bundled into the current
  // preview-stats.json yet.
  if (/^packages\/client\/src\/.+\.stories\.(?:js|jsx|mjs|ts|tsx)$/.test(p))
    return true
  if (/^packages\/client\/src\/.+\.mdx$/.test(p)) return true
  return false
}

// 4. Compute changed files vs the PR base.
const diff = execSync(`git diff --name-only ${base}...HEAD`, {
  encoding: 'utf8'
})
const changedFiles = diff.split('\n').filter(Boolean)

// 5. Intersect.
const affectingFiles = changedFiles.filter(
  (f) => relevantFiles.has(f) || isAlwaysRelevant(f)
)
const affects = affectingFiles.length > 0

console.log(`Bundled modules in preview-stats:    ${bundledFiles.size}`)
console.log(`Relevant files (with source mapping): ${relevantFiles.size}`)
console.log(`Changed files in PR:                  ${changedFiles.length}`)
console.log(`Files that can affect Storybook:      ${affectingFiles.length}`)

if (affects) {
  console.log('::group::Files that can affect Storybook')
  for (const f of affectingFiles) console.log(`  ${f}`)
  console.log('::endgroup::')
} else if (changedFiles.length > 0) {
  console.log('::group::Changed files (none affect Storybook)')
  for (const f of changedFiles) console.log(`  ${f}`)
  console.log('::endgroup::')
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `affects=${affects}\n`)
}
