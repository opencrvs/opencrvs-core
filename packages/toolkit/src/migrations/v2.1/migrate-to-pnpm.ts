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
 * Codemod: switch the country config from yarn to pnpm, the package manager
 * the v2.1 country config template — and so its Dockerfile and Tiltfile —
 * uses.
 *
 * What it does:
 *   1. Sets `packageManager` to the template's pnpm version.
 *   2. Converts `yarn.lock` with `pnpm import`, which resolves every
 *      dependency to the version `yarn.lock` pins, and deletes `yarn.lock`.
 *   3. Rewrites `yarn <script>` in the `package.json` scripts and lint-staged
 *      commands to `pnpm <script>`.
 *   4. Lists the other files that still run yarn (CI workflows, shell scripts,
 *      docs) — those are the country's own and are left to the dev.
 *
 * Caveats:
 *   - pnpm is run through corepack (bundled with Node 22) at the template's
 *     version, or from PATH when corepack is unavailable. With neither, the
 *     step is skipped and the Dockerfile and Tiltfile are left alone.
 *   - pnpm only links the dependencies `package.json` declares into
 *     `node_modules`, where yarn hoisted everything. Code importing a package
 *     it does not declare now fails to resolve — `pnpm test:compilation`
 *     reports it; add the package to `package.json`.
 *   - `node_modules` is not reinstalled: the upgrade is running from it. The
 *     dev runs `rm -rf node_modules && pnpm install` afterwards.
 */

import { execFileSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import path from 'path'
import {
  PackageJson,
  findTrackedReferences,
  readPackageJson,
  templatePackageManager,
  writePackageJson
} from './countryconfig-template'

const YARN_LOCK = 'yarn.lock'
const PNPM_LOCK = 'pnpm-lock.yaml'

/**
 * yarn commands pnpm has no drop-in equivalent for. A script using one is left
 * alone with a warning.
 */
const UNPORTABLE = /\byarn\s+(workspaces?|global|upgrade-interactive|--cwd)\b/

/**
 * `yarn` followed only by install flags (or nothing) is an install; pnpm needs
 * the subcommand spelled out.
 */
const BARE_INSTALL =
  /(^|[\s'"`;&|(])yarn((?:\s+--[\w-]+)*)(?=\s*(?:$|[;&|)'"`]))/g

const YARN_COMMAND = /(^|[\s'"`;&|(])yarn(?=\s)/g

/**
 * Rewrites a yarn invocation in a shell command to pnpm, or returns undefined
 * when the command uses something pnpm cannot run as is.
 */
export function rewriteYarnCommand(command: string): string | undefined {
  if (UNPORTABLE.test(command)) {
    return undefined
  }

  return command
    .replace(BARE_INSTALL, '$1pnpm install$2')
    .replace(YARN_COMMAND, '$1pnpm')
}

/**
 * Applies `rewriteYarnCommand` to the scripts and lint-staged commands.
 * Returns the names of what changed and of what could not be rewritten.
 */
export function rewritePackageJson(packageJson: PackageJson) {
  const changed: string[] = []
  const unportable: string[] = []

  function rewrite(name: string, command: string) {
    const rewritten = rewriteYarnCommand(command)

    if (rewritten === undefined) {
      unportable.push(name)
      return command
    }

    if (rewritten !== command) {
      changed.push(name)
    }

    return rewritten
  }

  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    packageJson.scripts![name] = rewrite(`scripts.${name}`, command)
  }

  for (const [glob, commands] of Object.entries(
    packageJson['lint-staged'] ?? {}
  )) {
    const name = `lint-staged["${glob}"]`
    packageJson['lint-staged']![glob] = Array.isArray(commands)
      ? commands.map((command) => rewrite(name, command))
      : rewrite(name, commands)
  }

  return { changed: [...new Set(changed)], unportable }
}

/**
 * The environment pnpm runs in. `yarn opencrvs upgrade` exports yarn's own
 * configuration as `npm_config_*`, which pnpm would read as its own.
 */
function pnpmEnv(): NodeJS.ProcessEnv {
  return {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) => !/^npm_(config|package|lifecycle)_/i.test(key)
      )
    ),
    COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
    COREPACK_ENABLE_STRICT: '0'
  }
}

/** How to run pnpm here: corepack at the pinned version, or pnpm on PATH. */
function findPnpm(cwd: string, packageManager: string) {
  const candidates: Array<[string, string[]]> = [
    ['corepack', [packageManager]],
    ['pnpm', []]
  ]

  for (const [command, prefix] of candidates) {
    try {
      execFileSync(command, [...prefix, '--version'], {
        cwd,
        env: pnpmEnv(),
        stdio: 'ignore'
      })
      return (args: string[]) =>
        execFileSync(command, [...prefix, ...args], {
          cwd,
          env: pnpmEnv(),
          stdio: ['ignore', 'inherit', 'inherit']
        })
    } catch {
      // try the next one
    }
  }

  return undefined
}

async function main(): Promise<void> {
  const cwd = process.cwd()

  console.log('\nSwitching from yarn to pnpm...\n')

  const hasYarnLock = existsSync(path.join(cwd, YARN_LOCK))

  if (!hasYarnLock) {
    if (existsSync(path.join(cwd, PNPM_LOCK))) {
      console.log('  Already on pnpm.')
    } else {
      console.warn(
        `  ⚠️  No ${YARN_LOCK} found, so there is nothing to convert. Switch to pnpm by hand: set packageManager to "${templatePackageManager()}" and run \`pnpm install\`.`
      )
    }
    return
  }

  const original = readPackageJson(cwd)

  if (!original) {
    console.warn('  ⚠️  package.json is missing or does not parse; skipped.')
    return
  }

  const packageManager = templatePackageManager()
  const pnpm = findPnpm(cwd, packageManager)

  if (!pnpm) {
    console.warn(
      `  ⚠️  Neither corepack nor pnpm is available, so the country config stays on yarn and the Dockerfile and Tiltfile are not updated. Install pnpm (https://pnpm.io/installation) and run \`opencrvs upgrade\` again.`
    )
    return
  }

  const packageJson: PackageJson = structuredClone(original)
  packageJson.packageManager = packageManager
  writePackageJson(cwd, packageJson)

  try {
    // A country config inside a pnpm workspace (opencrvs-core's CI clones one
    // into its checkout) would otherwise get its lockfile written to the
    // workspace root
    pnpm(['import', '--ignore-workspace'])

    if (!existsSync(path.join(cwd, PNPM_LOCK))) {
      throw new Error(`it did not write ${PNPM_LOCK} to ${cwd}`)
    }
  } catch (error) {
    writePackageJson(cwd, original)
    console.warn(
      `  ⚠️  \`pnpm import\` failed (${(error as Error).message}), so the country config stays on yarn. Fix the error and run \`opencrvs upgrade\` again.`
    )
    return
  }

  unlinkSync(path.join(cwd, YARN_LOCK))
  console.log(`  ✓ ${YARN_LOCK} -> ${PNPM_LOCK}`)
  console.log(`  ✓ package.json: packageManager = ${packageManager}`)

  const { changed, unportable } = rewritePackageJson(packageJson)
  writePackageJson(cwd, packageJson)

  for (const name of changed) {
    console.log(`  ✓ package.json: ${name}`)
  }
  for (const name of unportable) {
    console.warn(
      `  ⚠️  package.json: ${name} uses a yarn command pnpm has no equivalent for. Rewrite it by hand.`
    )
  }

  for (const file of ['.yarnrc', '.yarnrc.yml']) {
    if (existsSync(path.join(cwd, file))) {
      console.warn(
        `  ⚠️  ${file} is not read by pnpm. Move any registry or auth settings to .npmrc, then delete it.`
      )
    }
  }

  const leftovers = findTrackedReferences(
    cwd,
    ['(^|[^[:alnum:]_.@/-])yarn([[:space:]]|$)'],
    [
      'CHANGELOG.md',
      'package.json',
      YARN_LOCK,
      PNPM_LOCK,
      'Dockerfile',
      'Tiltfile'
    ]
  )

  if (leftovers.length > 0) {
    console.warn('\n  ⚠️  These lines still run yarn. Switch them to pnpm:')
    for (const line of leftovers) {
      console.warn(`    ${line}`)
    }
  }

  console.log(
    '\n  Reinstall the dependencies with pnpm once the upgrade has finished:\n' +
      '    rm -rf node_modules && pnpm install\n'
  )
}

export { main }
