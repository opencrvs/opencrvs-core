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

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const COUNTRYCONFIG_REPO_URL =
  'https://github.com/opencrvs/opencrvs-countryconfig.git'
const INFRASTRUCTURE_REPO_URL = 'https://github.com/opencrvs/infrastructure.git'

const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
)

function tagExists(repoUrl, tag) {
  try {
    execSync(
      'git ls-remote --exit-code --tags ' + repoUrl + ' refs/tags/' + tag,
      {
        stdio: 'pipe'
      }
    )
    return true
  } catch (err) {
    return false
  }
}

function resolveRef() {
  console.log('version: ' + version)
  /* if (version.includes('-')) {
    return 'develop'
  } */

  const tag = 'v' + version
  if (
    tagExists(COUNTRYCONFIG_REPO_URL, tag) &&
    tagExists(INFRASTRUCTURE_REPO_URL, tag)
  ) {
    return tag
  }

  console.warn(
    '\nWarning: tag "' +
      tag +
      '" was not found in both the country config and infrastructure ' +
      'repositories; falling back to develop for both.'
  )
  return 'develop'
}

function cloneRepository(repoUrl, ref, targetDir) {
  execSync(
    'git clone --depth 1 --branch ' + ref + ' ' + repoUrl + ' ' + targetDir,
    { stdio: 'inherit' }
  )
}

const projectName = process.argv[2]

if (!projectName) {
  console.error(
    'Please specify a project name:\n\n  npm create @opencrvs/countryconfig <project-name>\n'
  )
  process.exit(1)
}

const countryconfigDirName = projectName + '-countryconfig'
const infrastructureDirName = projectName + '-infrastructure'

const countryconfigTargetDir = path.resolve(process.cwd(), countryconfigDirName)
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

const ref = resolveRef()

console.log(
  '\nScaffolding OpenCRVS country config in ./' + countryconfigDirName + '...\n'
)

try {
  cloneRepository(COUNTRYCONFIG_REPO_URL, ref, countryconfigDirName)
} catch (err) {
  console.error('Failed to clone the country config repository:', err.message)
  process.exit(1)
}

try {
  fs.rmSync(path.join(countryconfigTargetDir, '.git'), {
    recursive: true,
    force: true
  })
} catch (err) {
  console.error(
    'Failed to remove .git directory from country config:',
    err.message
  )
  process.exit(1)
}

const pkgPath = path.join(countryconfigTargetDir, 'package.json')
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = countryconfigDirName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  } catch (err) {
    console.error('Failed to update package.json:', err.message)
    process.exit(1)
  }
} else {
  console.warn(
    'Warning: No package.json found in the cloned country config repository. Project name was not updated.'
  )
}

console.log(
  '\nScaffolding OpenCRVS infrastructure in ./' +
    infrastructureDirName +
    '...\n'
)

try {
  cloneRepository(INFRASTRUCTURE_REPO_URL, ref, infrastructureDirName)
} catch (err) {
  console.error('Failed to clone the infrastructure repository:', err.message)
  process.exit(1)
}

try {
  fs.rmSync(path.join(infrastructureTargetDir, '.git'), {
    recursive: true,
    force: true
  })
} catch (err) {
  console.error(
    'Failed to remove .git directory from infrastructure:',
    err.message
  )
  process.exit(1)
}

console.log('\nDone! Your project has been set up in two directories:\n')
console.log('  ./' + countryconfigDirName + '   -- country configuration')
console.log('  ./' + infrastructureDirName + '  -- server infrastructure\n')
console.log('To get started with the country config:\n')
console.log('  cd ' + countryconfigDirName)
console.log('  git init')
console.log('  npm install\n')
console.log('To get started with the infrastructure:\n')
console.log('  cd ' + infrastructureDirName)
console.log('  git init\n')
