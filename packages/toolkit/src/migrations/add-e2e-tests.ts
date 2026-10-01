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
 * Codemod: add the sample Playwright e2e tests from the country config
 * template.
 *
 * A country config keeps its own e2e tests in the `e2e/` directory. The
 * `e2e.yml` workflow of the infrastructure runs these tests after each
 * deployment to an environment that has E2E_ENABLED=true.
 *
 * The codemod runs only when the country config has no `e2e/` directory. It
 * does these steps:
 *   1. Copies the `e2e/` directory of the template.
 *   2. Writes the `playwright.config.ts` of the template. If the country config
 *      has a `playwright.config.ts` already, the codemod replaces it only when
 *      its `testDir` points into the missing `e2e/` directory (as in
 *      Farajaland). Otherwise, the codemod keeps the file.
 *   3. Adds the `e2e` scripts and the `@playwright/test` dev dependency to
 *      package.json, unless they are there already.
 *   4. Adds the output directories of Playwright to `.gitignore`.
 *
 * An existing `e2e/` directory holds the tests of the country. The codemod does
 * not change it.
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
function pointsIntoE2EDir(config: string) {
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
function withE2EPackageEntries(
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

function addE2ETests(cwd: string, templateDir: string) {
  if (existsSync(path.join(cwd, E2E_DIR))) {
    console.log(`  ↷ ${E2E_DIR}/ already exists, leaving it as is`)
    return false
  }

  // The template can be older than this codemod: it is downloaded from the
  // release branch or develop, which only have the e2e tests once they are merged.
  const templateFiles = listFiles(templateDir, E2E_DIR)
  if (
    templateFiles.length === 0 ||
    !existsSync(path.join(templateDir, PLAYWRIGHT_CONFIG))
  ) {
    console.warn(
      `  ⚠️  The country config template has no ${E2E_DIR}/ folder with ${PLAYWRIGHT_CONFIG}, so the sample e2e tests were not added.`
    )
    return false
  }

  for (const file of templateFiles) {
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

  const added = addE2ETests(process.cwd(), await findTemplateDir())

  if (added) {
    console.log(
      `\n  Install dependencies to add ${PLAYWRIGHT_PACKAGE} to your lockfile, then run the tests with: npx playwright test\n`
    )
  }
}

export { main }
