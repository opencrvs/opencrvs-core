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
import { readFileSync } from 'fs'
import path from 'path'
import type { IncomingMessage } from 'http'
import * as jwt from 'jsonwebtoken'
import { encodeScope, INTEGRATION_CREATOR_USER_ID } from '@opencrvs/commons'
import { createContext } from '@events/context'

const cert = readFileSync(path.resolve(__dirname, 'tests/cert.key'))

// Mirrors packages/auth/src/features/integrationCreatorToken/handler.ts
function mintBootstrapToken(subject: string, audience: string[]) {
  return jwt.sign(
    {
      scope: [encodeScope({ type: 'integration.create' })],
      userType: 'system'
    },
    cert,
    {
      subject,
      algorithm: 'RS256',
      expiresIn: 60,
      audience,
      issuer: 'opencrvs:auth-service'
    }
  )
}

// eslint-disable-next-line no-restricted-syntax
const asRequest = (token: string) =>
  ({ headers: { authorization: `Bearer ${token}` } }) as IncomingMessage

/**
 * The bootstrap token is minted by auth and spent against
 * `integrations.create` here, so its subject and audience are part of this
 * service's contract. Both pre-port failure modes are asserted below.
 */
describe('integration creator bootstrap token', () => {
  test('the ported token resolves as a system context', async () => {
    const ctx = await createContext({
      req: asRequest(
        mintBootstrapToken(INTEGRATION_CREATOR_USER_ID, [
          'opencrvs:countryconfig-user',
          'opencrvs:events-user'
        ])
      )
    })

    expect(ctx.user).toEqual({
      type: 'system',
      id: INTEGRATION_CREATOR_USER_ID
    })
  })

  test('the pre-port audience is rejected', async () => {
    const ctx = await createContext({
      req: asRequest(
        mintBootstrapToken(INTEGRATION_CREATOR_USER_ID, [
          'opencrvs:countryconfig-user',
          'opencrvs:user-mgnt-user'
        ])
      )
    })

    expect(ctx.user).toBeUndefined()
  })

  test('the pre-port non-UUID subject is rejected', async () => {
    const ctx = await createContext({
      req: asRequest(
        mintBootstrapToken('opencrvs:countryconfig-service', [
          'opencrvs:countryconfig-user',
          'opencrvs:events-user'
        ])
      )
    })

    expect(ctx.user).toBeUndefined()
  })
})
