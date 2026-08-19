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

const PRIMARY_DOMAIN = 'e2e.opencrvs.dev'
const FALLBACK_DOMAIN = 'qa.opencrvs.dev'
const HEALTH_CHECK_TIMEOUT_MS = 5000

async function isReachable(domain: string): Promise<boolean> {
  try {
    // Gateway's /ping is a public, no-auth health check - any HTTP response
    // (even a 5xx from a degraded sub-service) means DNS/TLS/networking to
    // the environment are working, which is all this check cares about.
    await fetch(`https://gateway.${domain}/ping`, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS)
    })
    return true
  } catch {
    return false
  }
}

/**
 * Resolves which shared environment testland e2e specs run against when
 * DOMAIN isn't explicitly set. e2e.opencrvs.dev is the primary target, but
 * the suite falls back to qa.opencrvs.dev if e2e.opencrvs.dev doesn't
 * respond (e.g. mid-deploy or down). An explicit DOMAIN env var always wins
 * and skips this check entirely.
 *
 * Runs once in the main test-runner process before workers are spawned, so
 * mutating process.env here is inherited by every worker.
 */
export default async function globalSetup() {
  if (process.env.DOMAIN) {
    return
  }

  if (await isReachable(PRIMARY_DOMAIN)) {
    process.env.DOMAIN = PRIMARY_DOMAIN
  } else {
    console.warn(
      `[global-setup] ${PRIMARY_DOMAIN} did not respond within ${HEALTH_CHECK_TIMEOUT_MS}ms - falling back to ${FALLBACK_DOMAIN}.`
    )
    process.env.DOMAIN = FALLBACK_DOMAIN
  }
}
