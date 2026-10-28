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

const REQUEST_TIMEOUT_MS = 10_000

type RegistryValidationResult = {
  status:
    | 'valid'
    // A value is missing, so there is nothing to check
    | 'skipped'
    | 'invalid-credentials'
    | 'repository-not-found'
    // The registry could not give a definitive answer (network, rate limit, outage)
    | 'unreachable'
  reason?: string
}

// Docker Hub serves its registry API from registry-1.docker.io, docker.io is the website
function registryApiHost(registry: string) {
  const host = registry.trim().toLowerCase()
  return host === 'docker.io' || host === 'index.docker.io'
    ? 'registry-1.docker.io'
    : host
}

function request(url: string | URL, authorization: string | undefined) {
  return fetch(url, {
    headers: authorization ? { Authorization: authorization } : {},
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })
}

function failure(
  registry: string,
  step: string,
  response: Response
): RegistryValidationResult {
  const reason = `${registry} ${step} responded with HTTP ${response.status}`
  switch (response.status) {
    case 401:
    case 403:
      return {
        status: 'invalid-credentials',
        reason: `${reason}. Check REGISTRY_USERNAME, REGISTRY_TOKEN, REGISTRY_ORGANISATION and REGISTRY_REPOSITORY`
      }
    case 404:
      // The API cannot tell an empty repository from one that does not exist
      return {
        status: 'repository-not-found',
        reason: `${reason}. This is also the answer for an empty repository. Check REGISTRY_ORGANISATION and REGISTRY_REPOSITORY`
      }
    default:
      return { status: 'unreachable', reason }
  }
}

/**
 * Checks, using the OCI Distribution (Docker Registry HTTP API v2) that every
 * registry implements, that the username/token pair is accepted by the registry
 * and that the organisation/repository is visible to that account.
 *
 * Existing GitHub secrets cannot be read back, so when any value is missing
 * (kept from an existing secret) the check is skipped.
 */
export async function validateRegistryCredentials(
  registry: string | undefined,
  organisation: string | undefined,
  repository: string | undefined,
  username: string | undefined,
  token: string | undefined
): Promise<RegistryValidationResult> {
  if (!registry || !organisation || !repository || !username || !token) {
    return {
      status: 'skipped',
      reason:
        'Some values are kept from existing GitHub secrets, which cannot be read back'
    }
  }

  const host = registryApiHost(registry)
  const name = `${organisation}/${repository}`
  const basic = `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`

  try {
    // A registry that wants a token names its token service in the challenge.
    // For any other answer the credentials are sent as they are.
    const challenge =
      (await request(`https://${host}/v2/`, undefined)).headers.get(
        'www-authenticate'
      ) ?? ''
    const realm = challenge.match(/realm="([^"]*)"/i)?.[1]
    const service = challenge.match(/service="([^"]*)"/i)?.[1]

    let authorization = basic
    if (/^\s*bearer/i.test(challenge) && realm) {
      const tokenUrl = new URL(realm)
      if (service) {
        tokenUrl.searchParams.set('service', service)
      }
      tokenUrl.searchParams.set('scope', `repository:${name}:pull`)

      const login = await request(tokenUrl, basic)
      if (!login.ok) {
        return failure(registry, 'login', login)
      }
      const body = (await login.json()) as {
        access_token?: string
        token?: string
      }
      authorization = `Bearer ${body.token ?? body.access_token}`
    }

    const path = name.split('/').map(encodeURIComponent).join('/')
    const response = await request(
      `https://${host}/v2/${path}/tags/list?n=1`,
      authorization
    )
    return response.ok
      ? { status: 'valid' }
      : failure(registry, `lookup of repository ${name}`, response)
  } catch (err) {
    if (!(err instanceof Error)) {
      return { status: 'unreachable', reason: String(err) }
    }
    // fetch only reports "fetch failed", the real error (e.g. ENOTFOUND) is its cause
    const cause = err.cause instanceof Error ? `: ${err.cause.message}` : ''
    return { status: 'unreachable', reason: `${err.message}${cause}` }
  }
}
