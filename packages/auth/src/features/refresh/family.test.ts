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
jest.mock('@auth/database', () => {
  const store = new Map<string, string>()
  return {
    redis: {
      get: jest.fn(async (k: string) => store.get(k) ?? null),
      set: jest.fn(async (k: string, v: string) => {
        store.set(k, v)
        return 'OK'
      }),
      del: jest.fn(async (k: string) => {
        store.delete(k)
        return 1
      }),
      __store: store
    }
  }
})

import {
  createFamily,
  consume,
  revokeFamily
} from '@auth/features/refresh/family'
import { redis } from '@auth/database'

const store = (redis as unknown as { __store: Map<string, string> }).__store

beforeEach(() => {
  store.clear()
  jest.restoreAllMocks()
})

test('createFamily writes a family record and returns ids', async () => {
  const { familyId, jti } = await createFamily('user-1')
  expect(familyId).toBeTruthy()
  expect(jti).toBeTruthy()
  const record = JSON.parse(store.get(`refresh_family:${familyId}`)!)
  expect(record).toMatchObject({
    userId: 'user-1',
    currentJti: jti,
    prevJti: null
  })
})

test('consume with the current jti rotates and advances the pointer', async () => {
  const { familyId, jti } = await createFamily('user-1')
  const result = await consume(familyId, jti)
  expect(result).toMatchObject({ status: 'rotate', userId: 'user-1' })
  const record = JSON.parse(store.get(`refresh_family:${familyId}`)!)
  expect(record.prevJti).toBe(jti)
  expect(record.currentJti).toBe((result as { newJti: string }).newJti)
  expect(record.currentJti).not.toBe(jti)
})

test('consume with the previous jti within grace is allowed (grace rotation)', async () => {
  const { familyId, jti } = await createFamily('user-1')
  await consume(familyId, jti) // jti is now prevJti, rotatedAt = now
  const result = await consume(familyId, jti)
  expect(result.status).toBe('grace')
  // family still exists (not revoked)
  expect(store.has(`refresh_family:${familyId}`)).toBe(true)
})

test('consume with the previous jti after the grace window is reuse and revokes the family', async () => {
  const { familyId, jti } = await createFamily('user-1')
  await consume(familyId, jti) // prevJti = jti, rotatedAt = T
  // advance the clock beyond the 60s grace window
  const future = Date.now() + 61_000
  jest.spyOn(Date, 'now').mockReturnValue(future)
  const result = await consume(familyId, jti)
  expect(result.status).toBe('reuse')
  expect(store.has(`refresh_family:${familyId}`)).toBe(false)
})

test('consume with an unknown jti is reuse and revokes the family', async () => {
  const { familyId } = await createFamily('user-1')
  const result = await consume(familyId, 'some-unknown-jti')
  expect(result.status).toBe('reuse')
  expect(store.has(`refresh_family:${familyId}`)).toBe(false)
})

test('consume on a missing family returns missing', async () => {
  const result = await consume('no-such-family', 'any')
  expect(result).toEqual({ status: 'missing' })
})

test('revokeFamily deletes the record', async () => {
  const { familyId } = await createFamily('user-1')
  await revokeFamily(familyId)
  expect(store.has(`refresh_family:${familyId}`)).toBe(false)
})
