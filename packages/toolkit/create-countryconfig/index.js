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

const REPO_URL = 'https://github.com/opencrvs/opencrvs-countryconfig.git'

const projectName = process.argv[2]

if (!projectName) {
  console.error(
    'Please specify a project name:\n\n  npm create @opencrvs/countryconfig <project-name>\n'
  )
  process.exit(1)
}

const targetDir = path.resolve(process.cwd(), projectName)

if (fs.existsSync(targetDir)) {
  console.error(`Error: Directory "${projectName}" already exists.`)
  process.exit(1)
}

console.log(`\nScaffolding OpenCRVS country config in ./${projectName}...\n`)

try {
  execSync(`git clone --depth 1 ${REPO_URL} ${projectName}`, {
    stdio: 'inherit'
  })

  fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true })

  const pkgPath = path.join(targetDir, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = projectName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  console.log(`\nDone! To get started:\n`)
  console.log(`  cd ${projectName}`)
  console.log(`  git init`)
  console.log(`  npm install\n`)
} catch (err) {
  console.error('Failed to clone the repository:', err.message)
  process.exit(1)
}
