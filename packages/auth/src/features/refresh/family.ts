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
import { redis } from '@auth/database'
import { env } from '@auth/environment'
import { getUUID } from '@opencrvs/commons'

const familyKey = (familyId: string) => `refresh_family:${familyId}`

interface FamilyRecord {
  userId: string
  currentJti: string
  prevJti: string | null
  rotatedAt: number
}

export type ConsumeResult =
  | { status: 'rotate' | 'grace'; userId: string; newJti: string }
  | { status: 'reuse'; userId: string }
  | { status: 'missing' }

export async function createFamily(
  userId: string
): Promise<{ familyId: string; jti: string }> {
  const familyId = getUUID()
  const jti = getUUID()
  const record: FamilyRecord = {
    userId,
    currentJti: jti,
    prevJti: null,
    rotatedAt: Date.now()
  }
  await redis.set(familyKey(familyId), JSON.stringify(record), {
    EX: env.CONFIG_REFRESH_TOKEN_EXPIRY_SECONDS
  })
  return { familyId, jti }
}

// NOTE: consume() reads then writes without a transaction. Concurrent refreshes on the
// same family (cross-tab, defeating client single-flight) can race so the loser's rotated
// token is orphaned → next use reads as reuse → family revoked. Accepted per spec
// (single-flight mitigates within a tab; Lua-script atomicity is deferred).
export async function consume(
  familyId: string,
  jti: string
): Promise<ConsumeResult> {
  const raw = await redis.get(familyKey(familyId))
  if (!raw) {
    return { status: 'missing' }
  }
  const record: FamilyRecord = JSON.parse(raw)

  const rotate = async (status: 'rotate' | 'grace'): Promise<ConsumeResult> => {
    const newJti = getUUID()
    const updated: FamilyRecord = {
      userId: record.userId,
      currentJti: newJti,
      prevJti: jti,
      rotatedAt: Date.now()
    }
    await redis.set(familyKey(familyId), JSON.stringify(updated), {
      EX: env.CONFIG_REFRESH_TOKEN_EXPIRY_SECONDS
    })
    return { status, userId: record.userId, newJti }
  }

  if (jti === record.currentJti) {
    return rotate('rotate')
  }

  const withinGrace =
    record.prevJti === jti &&
    Date.now() - record.rotatedAt <=
      env.CONFIG_REFRESH_TOKEN_GRACE_SECONDS * 1000

  if (withinGrace) {
    return rotate('grace')
  }

  await revokeFamily(familyId)
  return { status: 'reuse', userId: record.userId }
}

export async function revokeFamily(familyId: string): Promise<void> {
  await redis.del(familyKey(familyId))
}
