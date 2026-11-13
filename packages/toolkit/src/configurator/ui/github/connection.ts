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
// Checking a GitHub token before the form is used. The token is also meant for provisioning
// and for the self-hosted runner later, so it has to be able to manage the repository's
// environments, secrets and variables and to trigger its workflows.
export interface ConnectionSettings {
  token: string
  owner: string
  repo: string
}

export type ConnectionResult =
  | { ok: true; login: string; missingPermissions: string[] }
  | { ok: false; error: string }

export interface ConnectionPort {
  connect(settings: ConnectionSettings): Promise<ConnectionResult>
}

// Stand-in for the real check. It never sends the token anywhere.
//   "invalid"   in the token  ->  rejected
//   "readonly"  in the token  ->  accepted, but cannot trigger workflows
//   anything else non-empty   ->  accepted
export class MockConnection implements ConnectionPort {
  constructor(private readonly delayMs = 400) {}

  async connect({ token, owner, repo }: ConnectionSettings): Promise<ConnectionResult> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs))
    if (!owner.trim() || !repo.trim()) return { ok: false, error: 'Enter the repository owner and name.' }
    if (!token.trim()) return { ok: false, error: 'Enter a token.' }
    if (token.includes('invalid')) return { ok: false, error: 'GitHub rejected the token (bad credentials).' }
    return {
      ok: true,
      login: owner.trim(),
      missingPermissions: token.includes('readonly') ? ['trigger workflows'] : []
    }
  }
}
