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

async function main() {
  const projectName = process.argv[2]

  if (!projectName) {
    console.error(
      'Please specify a project name:\n\n  npm create @opencrvs/countryconfig <project-name>\n'
    )
    process.exit(1)
  }

  const countryconfigDirName = projectName + '-countryconfig'
  const infrastructureDirName = projectName + '-infrastructure'

  const countryconfigTargetDir = path.resolve(
    process.cwd(),
    countryconfigDirName
  )
  const infrastructureTargetDir = path.resolve(
    process.cwd(),
    infrastructureDirName
  )

  if (fs.existsSync(countryconfigTargetDir)) {
    console.error(
      'Error: Directory "' + countryconfigDirName + '" already exists.'
    )
    process.exit(1)
  }

  if (fs.existsSync(infrastructureTargetDir)) {
    console.error(
      'Error: Directory "' + infrastructureDirName + '" already exists.'
    )
    process.exit(1)
  }

  try {
    await cloneRepository(
      {
        repository: CORE_REPOSITORY,
        repositorySubPath: COUNTRYCONFIG_TEMPLATE_REPOSITORY_SUBPATH,
        branch: 'ocrvs-13179' // todo: remove this hardcoded branch once the countryconfig-template is merged into main
      },
      countryconfigTargetDir
    )
  } catch (err) {
    console.error('\nFailed to copy country config template:', err.message)
    process.exit(1)
  }

  console.log(
    '\nUpdating package.json with project name: ' + countryconfigDirName + '\n'
  )

  const pkgPath = path.join(countryconfigTargetDir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      pkg.name = countryconfigDirName
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    } catch (err) {
      console.error('\nFailed to update package.json:', err.message)
      process.exit(1)
    }
  } else {
    console.warn(
      '\nWarning: No package.json found in the cloned country config repository. Project name was not updated.'
    )
  }

  try {
    await cloneRepository(
      { repository: INFRASTRUCTURE_REPOSITORY },
      infrastructureTargetDir
    )
  } catch (err) {
    console.error('Failed to clone the infrastructure repository:', err.message)
    process.exit(1)
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
