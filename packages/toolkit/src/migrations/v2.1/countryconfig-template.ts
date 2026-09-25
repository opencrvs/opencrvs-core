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
 * The files of `packages/countryconfig-template` that the upgrade copies into a
 * country config, and the `package.json` plumbing the steps around them share.
 *
 * Unlike `add-translations`, which reads the template off GitHub so that a key
 * added in a patch release reaches everyone, these files ship inside the
 * toolkit: `build.sh` copies them to `dist/templates/countryconfig`. The
 * Dockerfile and Tilt setup have to match the toolkit version the country
 * installed rather than whatever the newest release branch carries, and a
 * directory like `tilt/` can be copied without listing it through the GitHub
 * API, which allows 60 unauthenticated requests an hour.
 */

import { execFileSync } from 'child_process'
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'fs'
import path from 'path'

/**
 * Where build.sh puts the template files: next to the bundled `dist/cli.js`,
 * or two levels up from the standalone `dist/migrations/v2.1/index.js`.
 */
const BUNDLED_DIRS = [
  path.join(__dirname, 'templates', 'countryconfig'),
  path.join(__dirname, '..', '..', 'templates', 'countryconfig')
]

/** The template itself, for running the migrations from source. */
const SOURCE_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'countryconfig-template'
)

/**
 * The name build.sh gives the template's `package.json`, so that the published
 * toolkit does not carry a second package manifest.
 */
const BUNDLED_PACKAGE_JSON = 'template.package.json'

export function templateDir(): string {
  const candidates = [...BUNDLED_DIRS, SOURCE_DIR]

  for (const dir of candidates) {
    if (existsSync(path.join(dir, 'Tiltfile'))) {
      return dir
    }
  }

  throw new Error(
    `The country config template files are missing from the toolkit (looked in ${candidates.join(', ')}). Reinstall @opencrvs/toolkit.`
  )
}

export function readTemplateFile(relativePath: string): string {
  return readFileSync(path.join(templateDir(), relativePath), 'utf8')
}

/** Every file under a template directory, relative to the template root. */
export function listTemplateFiles(relativeDir: string): string[] {
  const root = templateDir()

  function walk(dir: string): string[] {
    return readdirSync(path.join(root, dir))
      .sort()
      .flatMap((name) => {
        const relative = path.join(dir, name)
        return statSync(path.join(root, relative)).isDirectory()
          ? walk(relative)
          : [relative]
      })
  }

  return walk(relativeDir)
}

/** The template's `packageManager`, e.g. `pnpm@10.34.5`. */
export function templatePackageManager(): string {
  const dir = templateDir()
  const file = existsSync(path.join(dir, BUNDLED_PACKAGE_JSON))
    ? BUNDLED_PACKAGE_JSON
    : 'package.json'
  const { packageManager } = JSON.parse(
    readFileSync(path.join(dir, file), 'utf8')
  ) as { packageManager?: string }

  if (!packageManager) {
    throw new Error(`The template's ${file} does not set packageManager`)
  }

  return packageManager
}

// ─── package.json ────────────────────────────────────────────────────────────

export type PackageJson = {
  packageManager?: string
  scripts?: Record<string, string>
  'lint-staged'?: Record<string, string | string[]>
  [key: string]: unknown
}

export const PACKAGE_JSON = 'package.json'

/**
 * Reads the country config's `package.json`, or returns undefined when it is
 * missing or does not parse — the caller warns and skips.
 */
export function readPackageJson(cwd: string): PackageJson | undefined {
  const file = path.join(cwd, PACKAGE_JSON)

  if (!existsSync(file)) {
    return undefined
  }

  try {
    return JSON.parse(readFileSync(file, 'utf8')) as PackageJson
  } catch {
    return undefined
  }
}

/** Writes `package.json` back with the indentation it was read with. */
export function writePackageJson(cwd: string, contents: PackageJson): void {
  const file = path.join(cwd, PACKAGE_JSON)
  const raw = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const indent = raw.match(/^([ \t]+)"/m)?.[1] ?? '  '

  writeFileSync(file, JSON.stringify(contents, null, indent) + '\n')
}

// ─── Leftover references ─────────────────────────────────────────────────────

/**
 * The `file:line: text` of every line in a git-tracked file that matches one of
 * `patterns` (extended regular expressions), skipping `exclude`. Used to point
 * at what a step could not safely rewrite itself; returns nothing outside a git
 * repository, since there is then no telling generated files from sources.
 */
export function findTrackedReferences(
  cwd: string,
  patterns: string[],
  exclude: string[] = []
): string[] {
  try {
    const output = execFileSync(
      'git',
      [
        'grep',
        '-n',
        '-I',
        '-E',
        ...patterns.flatMap((pattern) => ['-e', pattern]),
        '--',
        '.',
        ...exclude.map((file) => `:(exclude)${file}`)
      ],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )

    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [file, lineNumber, ...text] = line.split(':')
        return `${file}:${lineNumber}: ${text.join(':').trim()}`
      })
  } catch {
    // git grep exits 1 when nothing matches, and 128 outside a repository
    return []
  }
}
