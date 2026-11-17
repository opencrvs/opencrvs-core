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

import { execFileSync } from 'child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { candidateRefs } from '../translations/template'

const CORE_REPO_URL = 'https://github.com/opencrvs/opencrvs-core.git'
const TEMPLATE_SUBPATH = 'packages/countryconfig-template'

let templateDir: string | undefined

/**
 * Set to the path of a country config template to use it instead of the one
 * downloaded from GitHub. The upgrade test in CI uses it to test the template
 * of the pull request. It also lets a developer test template changes that are
 * not merged yet.
 */
export const TEMPLATE_DIR_ENV = 'OPENCRVS_TEMPLATE_DIR'

/**
 * @returns template directory. The directory in OPENCRVS_TEMPLATE_DIR if it is
 * set. If not, downloads the template from GitHub.
 */
export async function findTemplateDir() {
  const override = process.env[TEMPLATE_DIR_ENV]
  if (override) {
    const overrideDir = path.resolve(override)
    if (!existsSync(path.join(overrideDir, 'Tiltfile'))) {
      throw new Error(
        `${TEMPLATE_DIR_ENV} is set to ${overrideDir}, but that is not a country config template: there is no Tiltfile in it.`
      )
    }
    return overrideDir
  }

  // Called more than once by the upgrade script, save the directory to prevent redownload.
  if (templateDir) {
    return templateDir
  }
  // 1. Find github ref version based on toolkit.
  const { version } = JSON.parse(
    readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
  )
  const [major, minor] = version.split('.')
  const [githubRef] = await candidateRefs(`${major}.${minor}`)

  // 2. create temporary directory where templates are downloaded
  const temporaryCheckoutDir = mkdtempSync(
    path.join(tmpdir(), 'opencrvs-template-')
  )

  // 3. Remove temporary directory on exit
  process.on('exit', () =>
    rmSync(temporaryCheckoutDir, { recursive: true, force: true })
  )

  // 4. Clone the latest commit without file contents or subdirectories
  execFileSync(
    'git',
    [
      'clone',
      '--depth',
      '1',
      '--filter=blob:none',
      '--sparse',
      '--branch',
      githubRef,
      CORE_REPO_URL,
      temporaryCheckoutDir
    ],
    { stdio: 'pipe' }
  )
  // 5. Download files from template directory only
  execFileSync('git', ['sparse-checkout', 'set', TEMPLATE_SUBPATH], {
    cwd: temporaryCheckoutDir,
    stdio: 'pipe'
  })

  templateDir = path.join(temporaryCheckoutDir, TEMPLATE_SUBPATH)
  return templateDir
}

/** Every file under `dir`, relative to `root`, with forward slashes. */
export function listFiles(root: string, dir: string): string[] {
  const absolute = path.join(root, dir)

  if (!existsSync(absolute)) {
    return []
  }

  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(root, relative) : [relative]
  })
}
