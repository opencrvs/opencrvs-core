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

const INFRASTRUCTURE_REPO_URL = 'https://github.com/opencrvs/infrastructure.git'
const COUNTRYCONFIG_TEMPLATE_PATH = path.resolve(
  __dirname,
  '../../countryconfig-template'
)

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

console.log(
  '\nCopying OpenCRVS country config template to ./' +
    countryconfigDirName +
    '...\n'
)

console.log(
  'cp -r ' + COUNTRYCONFIG_TEMPLATE_PATH + ' ' + countryconfigTargetDir
)
try {
  execSync(
    'cp -r ' + COUNTRYCONFIG_TEMPLATE_PATH + ' ' + countryconfigTargetDir,
    {
      stdio: 'inherit'
    }
  )
  console.log('\nCopying template completed successfully.\n')
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

console.log(
  '\nCloning OpenCRVS infrastructure repository from remote to ./' +
    infrastructureDirName +
    '...\n'
)

try {
  execSync(
    'git clone --depth 1 ' +
      INFRASTRUCTURE_REPO_URL +
      ' ' +
      infrastructureDirName,
    { stdio: 'inherit' }
  )
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
    '\nFailed to remove .git directory from infrastructure:',
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
console.log('  tilt up\n')
console.log('To get started with the infrastructure:\n')
console.log('  cd ' + infrastructureDirName)
console.log('  git init\n')
