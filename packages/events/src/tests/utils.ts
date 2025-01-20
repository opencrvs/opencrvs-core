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

import { appRouter } from '@events/router'
import { t } from '@events/router/trpc'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Scope, userRoleScopes } from '@opencrvs/commons'
import { CreatedUser, payloadGenerator } from './generators'
import * as events from '@events/storage/mongodb/__mocks__/events'
import * as userMgnt from '@events/storage/mongodb/__mocks__/user-mgnt'
import { seeder } from '@events/tests/generators'

const { createCallerFactory } = t

export function createTestClient(user: CreatedUser, scopes?: Scope[]) {
  const createCaller = createCallerFactory(appRouter)
  const token = createTestToken(user.id, scopes)

  const caller = createCaller({
    user: { id: user.id, primaryOfficeId: user.primaryOfficeId },
    token
  })
  return caller
}

function createTestToken(userId: string, scopes?: Scope[]) {
  return jwt.sign(
    { scope: scopes ?? userRoleScopes.REGISTRATION_AGENT, sub: userId },
    readFileSync(join(__dirname, './cert.key')),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:events-user'
    }
  )
}

/**
 *  Setup for test cases. Creates a user and locations in the database, and provides relevant client instances and seeders.
 */
export const setupTestCase = async () => {
  const generator = payloadGenerator()
  const eventsDb = await events.getClient()
  const userMgntDb = await userMgnt.getClient()

  const seed = seeder()
  const locations = generator.locations.set(5)
  await seed.locations(eventsDb, locations)

  const user = await seed.user(
    userMgntDb,
    generator.user.create({
      primaryOfficeId: locations[0].id
    })
  )

  return {
    locations,
    user,
    eventsDb,
    userMgntDb,
    seed,
    generator
  }
}
