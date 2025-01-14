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

import { appRouter, t } from '@events/router'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Scope, SCOPES } from '@opencrvs/commons'

const { createCallerFactory } = t

export function createTestClient(scopes?: Scope[]) {
  const createCaller = createCallerFactory(appRouter)
  const token = createTestToken(scopes)

  const caller = createCaller({
    user: { id: '1', primaryOfficeId: '123' },
    token
  })
  return caller
}

const createTestToken = (scopes?: Scope[]) =>
  jwt.sign(
    { scope: scopes ?? SCOPES.RECORD_SUBMIT_FOR_APPROVAL },
    readFileSync(join(__dirname, './cert.key')),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:events-user'
    }
  )
