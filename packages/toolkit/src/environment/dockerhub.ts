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

const DOCKER_HUB_API = 'https://hub.docker.com/v2'
const REQUEST_TIMEOUT_MS = 10_000

type DockerHubValidationResult = {
  status:
    | 'valid'
    // A value is missing, so there is nothing to check
    | 'skipped'
    | 'invalid-credentials'
    | 'repository-not-found'
    // Docker Hub could not give a definitive answer (network, rate limit, outage)
    | 'unreachable'
  reason?: string
}

/**
 * Checks that the username/token pair is accepted by Docker Hub and that the
 * organisation/repository exists and is visible to that account. An empty
 * repository is fine, only its existence matters.
 *
 * Existing GitHub secrets cannot be read back, so when any value is missing
 * (kept from an existing secret) the check is skipped.
 */
export async function validateDockerHubCredentials(
  organisation: string | undefined,
  repository: string | undefined,
  username: string | undefined,
  token: string | undefined
): Promise<DockerHubValidationResult> {
  if (!organisation || !repository || !username || !token) {
    return {
      status: 'skipped',
      reason:
        'Some values are kept from existing GitHub secrets, which cannot be read back'
    }
  }

  try {
    const login = await fetch(`${DOCKER_HUB_API}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, secret: token }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })

    if (login.status === 401 || login.status === 403) {
      return {
        status: 'invalid-credentials',
        reason:
          'Docker Hub rejected the username or token. Check DOCKER_USERNAME and DOCKER_TOKEN'
      }
    }
    if (!login.ok) {
      return {
        status: 'unreachable',
        reason: `Docker Hub login responded with HTTP ${login.status}`
      }
    }

    const body = (await login.json()) as {
      access_token?: string
      token?: string
    }
    const accessToken = body.access_token ?? body.token
    if (!accessToken) {
      return {
        status: 'unreachable',
        reason: 'Docker Hub login response did not contain an access token'
      }
    }

    const repositoryResponse = await fetch(
      `${DOCKER_HUB_API}/repositories/${encodeURIComponent(
        organisation
      )}/${encodeURIComponent(repository)}/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      }
    )

    if (repositoryResponse.ok) {
      return { status: 'valid' }
    }
    // Docker Hub answers 404 for private repositories the account cannot see
    if (repositoryResponse.status === 404) {
      return {
        status: 'repository-not-found',
        reason: `Login succeeded, but repository ${organisation}/${repository} was not found or is not accessible with this token. Check DOCKERHUB_ACCOUNT and DOCKERHUB_REPO`
      }
    }
    if (
      repositoryResponse.status === 401 ||
      repositoryResponse.status === 403
    ) {
      return {
        status: 'invalid-credentials',
        reason: `Login succeeded, but the token is not allowed to read repository ${organisation}/${repository}`
      }
    }
    return {
      status: 'unreachable',
      reason: `Docker Hub repository lookup responded with HTTP ${repositoryResponse.status}`
    }
  } catch (err) {
    if (!(err instanceof Error)) {
      return { status: 'unreachable', reason: String(err) }
    }
    // fetch only reports "fetch failed", the real error (e.g. ENOTFOUND) is its cause
    const cause = err.cause instanceof Error ? `: ${err.cause.message}` : ''
    return { status: 'unreachable', reason: `${err.message}${cause}` }
  }
}
