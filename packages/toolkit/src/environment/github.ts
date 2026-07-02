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

const sodium = require('libsodium-wrappers')
import { Octokit } from '@octokit/core'
import { error } from './logger'

export async function createEnvironmentVariable(
  octokit: Octokit,
  repositoryId: number,
  environment: string,
  name: string,
  value: string
): Promise<void> {
  await octokit.request(
    `POST /repositories/${repositoryId}/environments/${environment}/variables`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}
export async function updateEnvironmentVariable(
  octokit: Octokit,
  repositoryId: number,
  environment: string,
  name: string,
  value: string
): Promise<void> {
  await octokit.request(
    `PATCH /repositories/${repositoryId}/environments/${environment}/variables/${name}`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

// Create repository variable
export async function createRepositoryVariable(
  octokit: Octokit,
  repositoryId: number,
  name: string,
  value: string
): Promise<void> {
  await octokit.request(
    `POST /repositories/${repositoryId}/actions/variables`,
    {
      repository_id: repositoryId,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

// Update repository variable
export async function updateRepositoryVariable(
  octokit: Octokit,
  repositoryId: number,
  name: string,
  value: string
): Promise<void> {
  await octokit.request(
    `PATCH /repositories/${repositoryId}/actions/variables/${name}`,
    {
      repository_id: repositoryId,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function getRepositoryId(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  const response = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: owner,
    repo: repo
  })

  return response.data.id
}

async function getRepositoryPublicKey(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<any> {
  const res = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/secrets/public-key',
    {
      owner: owner,
      repo: repo
    }
  )

  return res.data
}

async function getPublicKey(
  octokit: Octokit,
  environment: string,
  ORGANISATION: string,
  REPOSITORY_NAME: string
): Promise<any> {
  const repositoryId = await getRepositoryId(
    octokit,
    ORGANISATION,
    REPOSITORY_NAME
  )

  await octokit.request(
    `PUT /repos/${ORGANISATION}/${REPOSITORY_NAME}/environments/${environment}`,
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  const res = await octokit.request(
    `GET /repositories/${repositoryId}/environments/${environment}/secrets/public-key`,
    {
      owner: ORGANISATION,
      repo: REPOSITORY_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return res.data
}

export async function createEnvironmentSecret(
  octokit: Octokit,
  repositoryId: number,
  environment: string,
  name: string,
  secret: string,
  organisationName: string,
  repositoryName: string
): Promise<void> {
  //Check if libsodium is ready and then proceed.
  await sodium.ready

  const { key, key_id } = await getPublicKey(
    octokit,
    environment,
    organisationName,
    repositoryName
  )

  // Convert Secret & Base64 key to Uint8Array.
  const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  const binsec = sodium.from_string(secret)

  //Encrypt the secret using LibSodium
  const encBytes = sodium.crypto_box_seal(binsec, binkey)

  // Convert encrypted Uint8Array to Base64
  const encryptedValue = sodium.to_base64(
    encBytes,
    sodium.base64_variants.ORIGINAL
  )

  await octokit.request(
    `PUT /repositories/${repositoryId}/environments/${environment}/secrets/${name}`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      secret_name: name,
      encrypted_value: encryptedValue,
      key_id,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function createRepositorySecret(
  octokit: Octokit,
  repositoryId: number,
  name: string,
  secret: string,
  organisationName: string,
  repositoryName: string
): Promise<void> {
  //Check if libsodium is ready and then proceed.
  await sodium.ready
  const { key, key_id } = await getRepositoryPublicKey(
    octokit,
    organisationName,
    repositoryName
  )

  // Convert Secret & Base64 key to Uint8Array.
  const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  const binsec = sodium.from_string(secret)

  //Encrypt the secret using LibSodium
  const encBytes = sodium.crypto_box_seal(binsec, binkey)

  // Convert encrypted Uint8Array to Base64
  const encryptedValue = sodium.to_base64(
    encBytes,
    sodium.base64_variants.ORIGINAL
  )

  await octokit.request(
    `PUT /repositories/${repositoryId}/actions/secrets/${name}`,
    {
      encrypted_value: encryptedValue,
      key_id,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function getRepositoryEnvironments(
  octokit: Octokit,
  githubOrganisation: string,
  repository: string
): Promise<string[]> {

  const response = await octokit.request('GET /repos/{githubOrganisation}/{repository}/environments', {
    githubOrganisation,
    repository,
  });

  // Safe access with fallback to empty array if undefined
  const environments = (response.data.environments ?? []).map(
    (env: { name: string }) => env.name
  );
  return environments;
}

export async function createEnvironment(
  octokit: Octokit,
  environment: string,
  ORGANISATION: string,
  REPOSITORY_NAME: string
): Promise<boolean> {
  try {
    await octokit.request(
      `PUT /repos/${ORGANISATION}/${REPOSITORY_NAME}/environments/${environment}`,
      {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
    return true
  } catch (err: any) {
    error(
      `Cannot create environment: [${err.status}] ${err.response?.data?.message}`
    )
    throw new Error(
      `Cannot create environment: [${err.status}] ${err.response?.data?.message}`
    )
  }
}

export type Secret = {
  type: 'SECRET'
  name: string
  scope: 'ENVIRONMENT' | 'REPOSITORY'
}
export type Variable = {
  type: 'VARIABLE'
  name: string
  value: string
  scope: 'ENVIRONMENT' | 'REPOSITORY'
}

export async function listEnvironmentSecrets(
  octokit: Octokit,
  owner: string,
  repositoryId: number,
  environmentName: string
): Promise<Secret[]> {
  const response = await octokit.request(
    'GET /repositories/{repository_id}/environments/{environment_name}/secrets',
    {
      owner: owner,
      repository_id: repositoryId,
      environment_name: environmentName,
      per_page: 100
    }
  )

  return response.data.secrets.map((secret: any) => ({
    ...secret,
    type: 'SECRET',
    scope: 'ENVIRONMENT'
  }))
}

export async function listRepositorySecrets(
  octokit: Octokit,
  owner: string,
  repositoryName: string
): Promise<Secret[]> {
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/secrets',
    {
      owner: owner,
      repo: repositoryName,
      per_page: 100
    }
  )
  return response.data.secrets.map((secret) => ({
    ...secret,
    type: 'SECRET',
    scope: 'REPOSITORY'
  }))
}

export async function listEnvironmentVariables(
  octokit: Octokit,
  repositoryId: number,
  environmentName: string
): Promise<Variable[]> {
  const response = await octokit.request(
    'GET /repositories/{repository_id}/environments/{environment_name}/variables',
    {
      repository_id: repositoryId,
      environment_name: environmentName,
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return response.data.variables
    .map((variable: any) => ({
      ...variable,
      type: 'VARIABLE' as const,
      scope: 'ENVIRONMENT' as const
    }))
    .filter((variable: { name: string }) => variable.name !== 'ACTIONS_RUNNER_DEBUG')
}


export async function listRepositoryVariables(
  octokit: Octokit,
  owner: string,
  repositoryName: string
): Promise<Variable[]> {
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/variables',
    {
      owner: owner,
      repo: repositoryName,
      per_page: 100
    }
  )
  return response.data.variables.map((variable) => ({
    ...variable,
    type: 'VARIABLE',
    scope: 'REPOSITORY'
  }))
}
