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

import { statSync } from 'fs'
import { resolve } from 'path'

const REQUIRED_REPOSITORY_DIRECTORIES = [
  '.github/workflows',
  'environments',
  'infrastructure'
] as const

function validateRepositoryStructure(repositoryRoot = process.cwd()) {
  const missingDirectories = REQUIRED_REPOSITORY_DIRECTORIES.filter(
    (directory) => {
      try {
        return !statSync(resolve(repositoryRoot, directory)).isDirectory()
      } catch {
        return true
      }
    }
  )

  if (missingDirectories.length > 0) {
    throw new Error(
      `The current directory is not a valid OpenCRVS country configuration repository. Missing required director${
        missingDirectories.length === 1 ? 'y' : 'ies'
      }: ${missingDirectories.join(', ')}`
    )
  }
}

export async function runEnvironmentInit() {
  validateRepositoryStructure()
  await import('./setup-environment.js')
}

export async function runEnvironmentUpdateWorkflows() {
  validateRepositoryStructure()
  const { updateWorkflowEnvironments } = await import('./update-workflows.js')
  await updateWorkflowEnvironments()
}

export async function runEnvironmentUsers() {
  validateRepositoryStructure()
  const { manageEnvironmentUsers } = await import('./users.js')
  await manageEnvironmentUsers()
}

export async function runEnvironmentSwarmToK8s() {
  validateRepositoryStructure()
  await import('./swarm-to-k8s.js')
}
