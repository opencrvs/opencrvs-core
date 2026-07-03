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

test('grace replay is idempotent: returns the current jti and leaves the record unchanged', async () => {
  const { familyId, jti } = await createFamily('user-1')
  const rotated = await consume(familyId, jti) // jti is now prevJti
  const before = store.get(`refresh_family:${familyId}`)!

  const grace = await consume(familyId, jti)

  expect(grace.status).toBe('grace')
  // hands back the already-issued rotated jti, not a fresh one
  expect((grace as { newJti: string }).newJti).toBe(
    (rotated as { newJti: string }).newJti
  )
  // family still exists (not revoked) and the record is untouched
  expect(store.get(`refresh_family:${familyId}`)).toBe(before)
})

test('grace does not slide the window: reuse is measured from the original rotation', async () => {
  const nowSpy = jest.spyOn(Date, 'now')
  nowSpy.mockReturnValue(1_000_000)
  const { familyId, jti } = await createFamily('user-1')
  await consume(familyId, jti) // rotate at T0 = 1_000_000

  // grace replay at T0 + 59s (within the 60s window)
  nowSpy.mockReturnValue(1_000_000 + 59_000)
  const grace = await consume(familyId, jti)
  expect(grace.status).toBe('grace')
  const record = JSON.parse(store.get(`refresh_family:${familyId}`)!)
  expect(record.rotatedAt).toBe(1_000_000) // NOT slid forward

  // at T0 + 61s the original window has elapsed → reuse (window did not slide)
  nowSpy.mockReturnValue(1_000_000 + 61_000)
  const reuse = await consume(familyId, jti)
  expect(reuse.status).toBe('reuse')
  expect(store.has(`refresh_family:${familyId}`)).toBe(false)
})

test('a grace replay of the old token does not invalidate the already-rotated token', async () => {
  const { familyId, jti } = await createFamily('user-1')
  const rotated = await consume(familyId, jti) // client now holds newJti
  const currentJti = (rotated as { newJti: string }).newJti

  await consume(familyId, jti) // grace replay of the old token

  // the legit rotated token must still rotate, not be seen as reuse
  const result = await consume(familyId, currentJti)
  expect(result.status).toBe('rotate')
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
