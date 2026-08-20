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

function branchExists(repoUrl, branch) {
  try {
    execSync(
      'git ls-remote --exit-code --heads ' + repoUrl + ' refs/heads/' + branch,
      {
        stdio: 'pipe'
      }
    )
    return true
  } catch (err) {
    return false
  }
}

/**
 * Release tags (e.g. "v2.1.0"), highest first. Delegates the version-aware
 * ordering to git itself rather than hand-parsing semver, then filters down
 * to strict "vX.Y.Z" tags - `--sort=-version:refname` alone still leaves in
 * non-release refs (e.g. "vtesting", "v2.0.0-beta") and peeled annotated-tag
 * lines ("refs/tags/v2.0.0^{}").
 */
function listReleaseTags(repoUrl) {
  const output = execSync(
    'git ls-remote --tags --sort=-version:refname ' + repoUrl,
    { encoding: 'utf-8' }
  )

  return output
    .split('\n')
    .map((line) => line.split('\t')[1])
    .filter(Boolean)
    .map((ref) => ref.replace('refs/tags/', ''))
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
}

/**
 * The highest release tag present in *both* repositories - used as the
 * fallback when the version-specific tag can't be found in one or both, so
 * scaffolding still lands on a real, matched release rather than develop.
 */
function getLatestCommonReleaseTag() {
  const infrastructureTags = new Set(listReleaseTags(INFRASTRUCTURE_REPO_URL))
  return (
    listReleaseTags(COUNTRYCONFIG_REPO_URL).find((tag) =>
      infrastructureTags.has(tag)
    ) || null
  )
}

/**
 * A prerelease-shaped own version (e.g. "2.1.0-rc.f5ea803", what npm resolves
 * `@next` to - a build published from every push to a branch) never has a
 * matching release tag, so it's resolved as a branch instead. Its base
 * version (stripped of the "-rc.<sha>" suffix) tells apart two different
 * situations: an RC for a version already being stabilized on its own
 * "release/X.Y.Z" branch (e.g. "2.0.1-rc.*" while a patch release is in
 * progress) versus an RC for a version that hasn't been branched off yet and
 * only exists on develop (e.g. "2.1.0-rc.*" while that release branch hasn't
 * been cut). Scaffold from the release branch when it exists in both
 * repositories, otherwise fall back to develop.
 *
 * Otherwise, the own "X.Y.Z" version - whether resolved via npm's `latest`
 * dist-tag (bare invocation) or an explicit `@X.Y.Z` pin - scaffolds from the
 * matching "vX.Y.Z" tag when it exists in both repositories. If it doesn't
 * (e.g. `latest` lagging behind the repos, or a pin that predates one repo's
 * tagging), fall back to the highest release tag common to both, rather than
 * a mismatched pairing of one tagged repo at that version and another repo
 * at a different release. Exits with an error if no matching release tag
 * exists in both repositories.
 */
function resolveRef() {
  if (version.includes('-')) {
    const releaseBranch = 'release/' + version.split('-')[0]
    if (
      branchExists(COUNTRYCONFIG_REPO_URL, releaseBranch) &&
      branchExists(INFRASTRUCTURE_REPO_URL, releaseBranch)
    ) {
      return releaseBranch
    }
    return 'develop'
  }

  const tag = 'v' + version
  if (
    tagExists(COUNTRYCONFIG_REPO_URL, tag) &&
    tagExists(INFRASTRUCTURE_REPO_URL, tag)
  ) {
    return tag
  }

  const latestCommonTag = getLatestCommonReleaseTag()
  if (latestCommonTag) {
    console.warn(
      '\nWarning: tag "' +
        tag +
        '" was not found in both repositories; falling back to the latest ' +
        'available release, ' +
        latestCommonTag +
        '.'
    )
    return latestCommonTag
  }

  console.error(
    '\nError: no matching release tag was found in both the country config and ' +
      'infrastructure repositories.'
  )
  process.exit(1)
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
