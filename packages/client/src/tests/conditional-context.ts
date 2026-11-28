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
import { UserConditionalContext } from '@opencrvs/commons/client'
import { EventlessFormConditionalContext } from '@client/v2-events/components/forms/formConditionalContext'
import { testUserTokenClaims } from './test-users'

const { subject, scope, userType, role } = testUserTokenClaims.legacyDefault

/** The default test user, who has no scopes. */
const defaultTestUser: UserConditionalContext = {
  sub: subject,
  scope,
  userType,
  role
}

/**
 * Returns the context of a form without an event, for unit tests.
 * @param user the user of the context. The default is the default test user, who has no scopes.
 */
export function generateTestEventlessConditionalContext(
  user: UserConditionalContext = defaultTestUser
): EventlessFormConditionalContext {
  return { user, leafAdminStructureLocationIds: [] }
}
