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
import type { GitHubPort } from './port'

// Is GitHub usable right now? No when it was skipped, when the dev server no longer holds the connection
// (it keeps the token in memory, so a restart forgets it), and when the dev server cannot be reached.
// The page then behaves as if GitHub had been skipped: no secrets are asked for or generated.
export async function isGitHubAvailable(github?: GitHubPort): Promise<boolean> {
  if (!github) return false
  try {
    return (await github.status()).connected
  } catch {
    return false
  }
}
