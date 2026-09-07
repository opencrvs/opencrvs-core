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
const { execSync } = require('child_process')
const readline = require('readline/promises')
const degit = require('degit').default

const INFRASTRUCTURE_REPOSITORY = 'opencrvs/infrastructure'
const CORE_REPOSITORY = 'opencrvs/opencrvs-core'
const COUNTRYCONFIG_TEMPLATE_REPOSITORY_SUBPATH =
  'packages/countryconfig-template'

const CORE_REPO_URL = 'https://github.com/' + CORE_REPOSITORY + '.git'
const INFRASTRUCTURE_REPO_URL =
  'https://github.com/' + INFRASTRUCTURE_REPOSITORY + '.git'

const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
)

function joinValues(values, separator) {
  return values
    .filter((value) => !!value)
    .join(separator)
    .trim()
}

function tagExists(repoUrl, tag) {
  try {
    execSync(
      'git ls-remote --exit-code --tags ' + repoUrl + ' refs/tags/' + tag,
      { stdio: 'pipe' }
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
      { stdio: 'pipe' }
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
    listReleaseTags(CORE_REPO_URL).find((tag) => infrastructureTags.has(tag)) ||
    null
  )
}

/**
 * Resolves the ref that both repositories are cloned from. A single ref
 * clones both, so every candidate must exist in *both* - a tag present in
 * only one of them can't be used.
 *
 * The exact "v<version>" tag wins whenever it exists: it pins a commit, so
 * a release, an explicit `@X.Y.Z` pin, or a blessed prerelease (npm `@beta`,
 * published from that tag) reproduces however late it's scaffolded.
 *
 * Otherwise a prerelease falls back to a branch, since a rolling release
 * candidate (npm `@next`) is never tagged: "release/X.Y.Z" of the base
 * version when that release has been cut, otherwise develop. A release
 * falls back to the highest tag common to both repositories - never a
 * mismatched pairing of the two at different releases - or errors.
 */
function resolveRef() {
  const versionTag = 'v' + version
  if (
    tagExists(CORE_REPO_URL, versionTag) &&
    tagExists(INFRASTRUCTURE_REPO_URL, versionTag)
  ) {
    return versionTag
  }

  if (version.includes('-')) {
    const releaseBranch = 'release/' + version.split('-')[0]
    if (
      branchExists(CORE_REPO_URL, releaseBranch) &&
      branchExists(INFRASTRUCTURE_REPO_URL, releaseBranch)
    ) {
      return releaseBranch
    }
    return 'develop'
  }

  const latestCommonTag = getLatestCommonReleaseTag()
  if (latestCommonTag) {
    console.warn(
      '\nWarning: tag "' +
        versionTag +
        '" was not found in both repositories; falling back to the latest ' +
        'available release, ' +
        latestCommonTag +
        '.'
    )
    return latestCommonTag
  }

  console.error(
    '\nError: no matching release tag was found in both the core and ' +
      'infrastructure repositories.'
  )
  process.exit(1)
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
 * Prompts for a single line of input, re-asking until `validate` accepts the
 * trimmed answer. `validate` returns an error message string when the answer is
 * invalid, or a falsy value when it is accepted. Exits when not attached to a
 * terminal, since a mandatory value cannot be gathered non-interactively.
 */
async function promptRequired(question, validate) {
  if (!process.stdin.isTTY) {
    console.error(
      '\nError: interactive input is required to set the organisation name and country code.'
    )
    process.exit(1)
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  try {
    while (true) {
      const answer = (await rl.question(question)).trim()
      const error = validate(answer)
      if (!error) {
        return answer
      }
      console.error(error)
    }
  } finally {
    rl.close()
  }
}

/**
 * Prompts for the organisation name reported with telemetry. Mandatory.
 */
function promptOrganisation() {
  return promptRequired('\nOrganisation running this instance: ', (answer) =>
    answer === '' ? 'Please enter an organisation name.' : undefined
  )
}

/**
 * Prompts for the alpha-3 ISO country code reported with telemetry, re-asking
 * until a valid three-letter code is given. Mandatory.
 */
async function promptCountryCode() {
  const answer = await promptRequired(
    '\nAlpha-3 ISO country code of this instance (e.g. "GBR"): ',
    (value) =>
      /^[A-Za-z]{3}$/.test(value)
        ? undefined
        : 'Please enter a three-letter alpha-3 ISO country code (e.g. "GBR").'
  )
  return answer.toUpperCase()
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

/**
 * Replaces the string `default` of an envalid `str({ ... })` field in the
 * cloned country config's environment. Returns the updated source, or the
 * original source (with a warning) when the field could not be located.
 */
function setEnvironmentStringDefault(source, key, value) {
  const pattern = new RegExp(
    `(${key}:\\s*str\\(\\{[\\s\\S]*?default:\\s*)'[^']*'`
  )
  // Escape for a single-quoted TS string literal, and use a function replacer
  // so `$` in the value is not treated as a replacement pattern.
  const literal = "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
  const updated = source.replace(pattern, (_, prefix) => prefix + literal)

  if (updated === source) {
    console.warn(
      `\nWarning: could not update the ${key} default in src/environment.ts.`
    )
  }

  return updated
}

/**
 * Writes the given organisation name and alpha-3 country code as the defaults
 * for the `ORGANISATION` and `COUNTRY_CODE` env vars in the cloned country
 * config's environment.
 */
function setTelemetryIdentityInEnvironment(
  targetPath,
  { organisation, countryCode }
) {
  const environmentPath = path.join(targetPath, 'src', 'environment.ts')
  if (!fs.existsSync(environmentPath)) {
    console.warn(
      '\nWarning: could not find src/environment.ts; organisation and country code defaults not changed.'
    )
    return
  }

  let source = fs.readFileSync(environmentPath, 'utf-8')
  source = setEnvironmentStringDefault(source, 'ORGANISATION', organisation)
  source = setEnvironmentStringDefault(source, 'COUNTRY_CODE', countryCode)
  fs.writeFileSync(environmentPath, source)
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

  const ref = resolveRef()

  // Gather all answers up front so the operator isn't interrupted mid-clone.
  const organisation = await promptOrganisation()
  const countryCode = await promptCountryCode()
  const telemetryEnabled = await promptEnableTelemetry()

  try {
    await cloneRepository(
      {
        repository: CORE_REPOSITORY,
        repositorySubPath: COUNTRYCONFIG_TEMPLATE_REPOSITORY_SUBPATH,
        branch: ref
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
      { repository: INFRASTRUCTURE_REPOSITORY, branch: ref },
      infrastructureTargetPath
    )
  } catch (err) {
    console.error('Failed to clone the infrastructure repository:', err.message)
    process.exit(1)
  }

  setTelemetryIdentityInEnvironment(countryconfigTargetPath, {
    organisation,
    countryCode
  })

  if (telemetryEnabled) {
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
