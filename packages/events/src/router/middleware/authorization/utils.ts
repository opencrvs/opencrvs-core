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

import {
  getScopes,
  decodeScope,
  RecordScopeTypeV2,
  RecordScopeV2,
  canAccessEventWithScope,
  userCanAccessEventWithScopes
} from '@opencrvs/commons'

export { canAccessEventWithScope, userCanAccessEventWithScopes }

export function getAcceptedScopesFromToken(
  token: string,
  acceptedScopes: RecordScopeTypeV2[]
) {
  const tokenScopes = getScopes(token)

  return tokenScopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope && acceptedScopes.includes(parsedScope.type)
        ? parsedScope
        : null
    })
    .filter((scope): scope is RecordScopeV2 => scope !== null)
}
