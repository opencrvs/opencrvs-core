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
 * Codemod: add the sample Playwright e2e suite from the country config template.
 *
 * Core's own e2e suite moved from the country configs into
 * opencrvs-core/packages/testland. Country configs keep a suite of their own
 * under `e2e/`, which the infrastructure `e2e.yml` workflow runs after every
 * deployment to an environment with E2E_ENABLED=true.
 *
 * What it does, only when the country config has no `e2e/` directory yet:
 *   1. Copies the template's `e2e/` directory.
 *   2. Writes the template's `playwright.config.ts`. An existing config is
 *      replaced only when its `testDir` points into the missing `e2e/`
 *      directory (as Farajaland's did), otherwise it is left in place.
 *   3. Adds the `e2e` scripts and the `@playwright/test` dev dependency to
 *      package.json, unless they are already there.
 *   4. Adds Playwright's output directories to `.gitignore`.
 *
 * An existing `e2e/` directory is the country's own suite and is left alone.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { findTemplateDir, listFiles } from './template-files'
import { withIgnoreEntry } from './upgrade-tilt'

const E2E_DIR = 'e2e'
const PLAYWRIGHT_CONFIG = 'playwright.config.ts'
const PLAYWRIGHT_PACKAGE = '@playwright/test'
const E2E_SCRIPTS = ['e2e', 'e2e:ui', 'e2e:dev']
const IGNORED_PATHS = ['playwright-report', 'test-results']

const TEST_DIR_PATTERN = /testDir\s*:\s*(["'`])(.*?)\1/

function copyFile(templateDir: string, cwd: string, file: string) {
  const target = path.join(cwd, file)
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, readFileSync(path.join(templateDir, file), 'utf8'))
}

/** Whether a Playwright config only runs tests from the `e2e/` directory. */
export function pointsIntoE2EDir(config: string) {
  const testDir = config.match(TEST_DIR_PATTERN)?.[2]

  if (testDir === undefined) {
    return false
  }

  return path.posix.normalize(testDir).split('/')[0] === E2E_DIR
}

type PackageJson = {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/** `packageJson` with the template's e2e scripts and Playwright dependency added where missing. */
export function withE2EPackageEntries(
  packageJson: PackageJson,
  templatePackageJson: PackageJson
) {
  const scripts = { ...packageJson.scripts }

  for (const script of E2E_SCRIPTS) {
    const templateScript = templatePackageJson.scripts?.[script]
    if (templateScript && !scripts[script]) {
      scripts[script] = templateScript
    }
  }

  const hasPlaywright =
    !!packageJson.dependencies?.[PLAYWRIGHT_PACKAGE] ||
    !!packageJson.devDependencies?.[PLAYWRIGHT_PACKAGE]
  const playwrightVersion =
    templatePackageJson.devDependencies?.[PLAYWRIGHT_PACKAGE]

  return {
    ...packageJson,
    scripts,
    ...(hasPlaywright || !playwrightVersion
      ? {}
      : {
          devDependencies: {
            ...packageJson.devDependencies,
            [PLAYWRIGHT_PACKAGE]: playwrightVersion
          }
        })
  }
}

export function addE2ETests(cwd: string, templateDir: string) {
  if (existsSync(path.join(cwd, E2E_DIR))) {
    console.log(`  ↷ ${E2E_DIR}/ already exists, leaving it as is`)
    return false
  }

  for (const file of listFiles(templateDir, E2E_DIR)) {
    copyFile(templateDir, cwd, file)
    console.log(`  ✓ created ${file}`)
  }

  const configPath = path.join(cwd, PLAYWRIGHT_CONFIG)
  if (!existsSync(configPath)) {
    copyFile(templateDir, cwd, PLAYWRIGHT_CONFIG)
    console.log(`  ✓ created ${PLAYWRIGHT_CONFIG}`)
  } else if (pointsIntoE2EDir(readFileSync(configPath, 'utf8'))) {
    copyFile(templateDir, cwd, PLAYWRIGHT_CONFIG)
    console.log(`  ✓ updated ${PLAYWRIGHT_CONFIG}`)
  } else {
    console.warn(
      `  ⚠️  ${PLAYWRIGHT_CONFIG} does not run tests from ${E2E_DIR}/ and was left in place. Point its testDir to './${E2E_DIR}' and testMatch to '**/*.e2e.ts' to run the sample tests.`
    )
  }

  const packageJsonPath = path.join(cwd, 'package.json')
  if (existsSync(packageJsonPath)) {
    const contents = readFileSync(packageJsonPath, 'utf8')
    const updated = withE2EPackageEntries(
      JSON.parse(contents),
      JSON.parse(readFileSync(path.join(templateDir, 'package.json'), 'utf8'))
    )
    // Keep the file's trailing newline, if it had one.
    const trailingNewline = contents.endsWith('\n') ? '\n' : ''
    const serialised = `${JSON.stringify(updated, null, 2)}${trailingNewline}`

    if (serialised !== contents) {
      writeFileSync(packageJsonPath, serialised)
      console.log('  ✓ updated package.json')
    }
  }

  const gitignorePath = path.join(cwd, '.gitignore')
  const gitignore = existsSync(gitignorePath)
    ? readFileSync(gitignorePath, 'utf8')
    : ''
  const updatedGitignore = IGNORED_PATHS.reduce(withIgnoreEntry, gitignore)
  if (updatedGitignore !== gitignore) {
    writeFileSync(gitignorePath, updatedGitignore)
    console.log('  ✓ updated .gitignore')
  }

  return true
}

async function main() {
  console.log('Adding sample e2e tests...\n')

  const added = addE2ETests(process.cwd(), findTemplateDir())

  if (added) {
    console.log(
      `\n  Install dependencies to add ${PLAYWRIGHT_PACKAGE} to your lockfile, then run the tests with: npx playwright test\n`
    )
  }
}

export { main }
