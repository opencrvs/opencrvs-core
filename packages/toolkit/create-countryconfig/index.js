#!/usr/bin/env node

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

const path = require('path')
const fs = require('fs')
const readline = require('readline/promises')
const degit = require('degit').default

const INFRASTRUCTURE_REPOSITORY = 'opencrvs/infrastructure'
const CORE_REPOSITORY = 'opencrvs/opencrvs-core'
const COUNTRYCONFIG_TEMPLATE_REPOSITORY_SUBPATH =
  'packages/countryconfig-template'

function joinValues(values, separator) {
  return values
    .filter((value) => !!value)
    .join(separator)
    .trim()
}

/**
 * Clones a repository from GitHub to a target directory.
 *
 * @param {*} param0 repository - The repository to clone (e.g., 'opencrvs/opencrvs-core').
 * @param {*} param0 repositorySubPath - The subpath within the repository to clone (optional). Otherwise the entire repository will be cloned.
 * @param {*} param0 branch - The branch to clone (optional). Defaults to the default branch if not specified.
 *
 * @param {*} targetDir - The target directory where the repository will be cloned.
 */
async function cloneRepository(
  { repository, repositorySubPath, branch },
  targetDir
) {
  const repositoryPath = joinValues([repository, repositorySubPath], '/')
  const fullPath = joinValues([repositoryPath, branch], '#')

  console.log(`Cloning repository from ${fullPath} to ${targetDir}...`)

  const emitter = degit(fullPath, {
    mode: 'git'
  })

  await emitter.clone(targetDir)
  console.log(`Copied files from ${fullPath} to ${targetDir} succesfully.`)
}

function ensureTargetDirectoryDoesNotExist(directoryName) {
  const targetDirectoryPath = path.resolve(process.cwd(), directoryName)

  if (fs.existsSync(targetDirectoryPath)) {
    console.error(
      'Error: Directory already exists in path "' + targetDirectoryPath + '".'
    )
    process.exit(1)
  }
}

/**
 * Asks whether to enable telemetry. Defaults to yes, and answers yes without
 * prompting when not attached to a terminal (e.g. non-interactive scaffolding).
 */
async function promptEnableTelemetry() {
  if (!process.stdin.isTTY) {
    return true
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  try {
    const answer = (
      await rl.question(
        '\nEnable anonymous usage telemetry to help improve OpenCRVS? Only ' +
          'aggregate metrics are shared — no personal or protected data. [Y/n] '
      )
    )
      .trim()
      .toLowerCase()
    return answer === '' || answer === 'y' || answer === 'yes'
  } finally {
    rl.close()
  }
}

/**
 * Flips the `TELEMETRY_ENABLED` env var default in the cloned country config's
 * environment to `true`. The template ships it defaulting to `false`.
 */
function enableTelemetryInEnvironment(targetPath) {
  const environmentPath = path.join(targetPath, 'src', 'environment.ts')
  if (!fs.existsSync(environmentPath)) {
    console.warn(
      '\nWarning: could not find src/environment.ts; telemetry default not changed.'
    )
    return
  }

  const original = fs.readFileSync(environmentPath, 'utf-8')
  const updated = original.replace(
    /(TELEMETRY_ENABLED:\s*bool\(\{[\s\S]*?default:\s*)false/,
    '$1true'
  )

  if (updated === original) {
    console.warn(
      '\nWarning: could not update the TELEMETRY_ENABLED default in src/environment.ts.'
    )
    return
  }

  fs.writeFileSync(environmentPath, updated)
  console.log('\nTelemetry enabled (TELEMETRY_ENABLED now defaults to true).')
}

function updatePackageJsonName(targetPath, newName) {
  console.log('\nUpdating package.json with project name: ' + newName + '\n')

  const pkgPath = path.join(targetPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      pkg.name = newName
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    } catch (err) {
      console.error('\nFailed to update package.json:', err.message)
      process.exit(1)
    }
  } else {
    console.warn(
      '\nWarning: No package.json found in the targetPath: ' +
        targetPath +
        '. Project name was not updated.'
    )
  }
}

async function main() {
  const projectName = process.argv[2]

  if (!projectName) {
    console.error(
      'Please specify a project name:\n\n  npm create @opencrvs/countryconfig <project-name>\n'
    )
    process.exit(1)
  }

  const countryconfigDirName = projectName + '-countryconfig'
  const countryconfigTargetPath = path.resolve(
    process.cwd(),
    countryconfigDirName
  )
  const infrastructureDirName = projectName + '-infrastructure'
  const infrastructureTargetPath = path.resolve(
    process.cwd(),
    infrastructureDirName
  )

  ensureTargetDirectoryDoesNotExist(countryconfigDirName)
  ensureTargetDirectoryDoesNotExist(infrastructureDirName)

  try {
    await cloneRepository(
      {
        repository: CORE_REPOSITORY,
        repositorySubPath: COUNTRYCONFIG_TEMPLATE_REPOSITORY_SUBPATH
      },
      countryconfigTargetPath
    )
  } catch (err) {
    console.error('\nFailed to clone country config template:', err.message)
    process.exit(1)
  }

  updatePackageJsonName(countryconfigTargetPath, countryconfigDirName)

  try {
    await cloneRepository(
      { repository: INFRASTRUCTURE_REPOSITORY },
      infrastructureTargetPath
    )
  } catch (err) {
    console.error('Failed to clone the infrastructure repository:', err.message)
    process.exit(1)
  }

  if (await promptEnableTelemetry()) {
    enableTelemetryInEnvironment(countryconfigTargetPath)
  }

  console.log('\nDone! Your project has been set up in two directories:\n')
  console.log('  ./' + countryconfigDirName + '   -- country configuration')
  console.log('  ./' + infrastructureDirName + '  -- server infrastructure\n')
  console.log('To get started with the country config:\n')
  console.log('  cd ' + countryconfigDirName)
  console.log('  git init')
  console.log('  tilt up\n')
  console.log('To get started with the infrastructure:\n')
  console.log('  cd ' + infrastructureDirName)
  console.log('  git init\n')
}

main()
