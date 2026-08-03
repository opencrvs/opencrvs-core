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
  EventConfig,
  getUUID,
  logger,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { getClient } from '@events/storage/postgres/events'
import { getOrCreateEvent } from '@events/storage/postgres/events/events'
import { backfillMissingConfigVersions } from './backfillConfigVersion'

function createTrackingId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

async function createLegacyEvent({
  eventType,
  createdAt
}: {
  eventType: string
  createdAt: string
}) {
  const event = await getOrCreateEvent({
    eventType,
    transactionId: getUUID(),
    trackingId: createTrackingId(),
    createdBy: 'test-user',
    createdByUserType: TokenUserType.enum.user,
    createdAt,
    updatedAt: createdAt,
    // Simulates a record created before form versioning existed.
    configVersion: null
  })

  return event.id
}

async function getConfigVersion(eventId: UUID) {
  const row = await getClient()
    .selectFrom('events')
    .select('configVersion')
    .where('id', '=', eventId)
    .executeTakeFirstOrThrow()

  return row.configVersion
}

describe('backfillMissingConfigVersions', () => {
  it('pins a legacy event to the version whose window covers its createdAt', async () => {
    const v1: EventConfig = {
      ...tennisClubMembershipEvent,
      version: 'v1',
      effectiveFrom: '2015-01-01' as EventConfig['effectiveFrom'],
      effectiveTo: '2020-01-01' as EventConfig['effectiveFrom']
    }
    const v2: EventConfig = {
      ...tennisClubMembershipEvent,
      version: 'v2',
      effectiveFrom: '2020-01-01' as EventConfig['effectiveFrom']
    }

    const oldEventId = await createLegacyEvent({
      eventType: tennisClubMembershipEvent.id,
      createdAt: new Date('2017-06-01').toISOString()
    })
    const newerEventId = await createLegacyEvent({
      eventType: tennisClubMembershipEvent.id,
      createdAt: new Date('2022-06-01').toISOString()
    })

    const backfilled = await backfillMissingConfigVersions([v1, v2])

    expect(backfilled).toBe(2)
    expect(await getConfigVersion(oldEventId)).toBe('v1')
    expect(await getConfigVersion(newerEventId)).toBe('v2')
  })

  it('clamps to the earliest version and warns when no window covers the date', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)

    const futureOnly: EventConfig = {
      ...tennisClubMembershipEvent,
      version: 'v1',
      effectiveFrom: '2099-01-01' as EventConfig['effectiveFrom']
    }

    const eventId = await createLegacyEvent({
      eventType: tennisClubMembershipEvent.id,
      createdAt: new Date('2017-06-01').toISOString()
    })

    const backfilled = await backfillMissingConfigVersions([futureOnly])

    expect(backfilled).toBe(1)
    expect(await getConfigVersion(eventId)).toBe('v1')
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('clamping to earliest known version')
    )

    warnSpy.mockRestore()
  })

  it('leaves events of an unconfigured type untouched', async () => {
    const eventId = await createLegacyEvent({
      eventType: 'some-retired-event-type',
      createdAt: new Date('2017-06-01').toISOString()
    })

    const backfilled = await backfillMissingConfigVersions([
      { ...tennisClubMembershipEvent, version: 'v1' }
    ])

    expect(backfilled).toBe(0)
    expect(await getConfigVersion(eventId)).toBeNull()
  })

  it('is a no-op when nothing is missing a configVersion', async () => {
    const backfilled = await backfillMissingConfigVersions([
      { ...tennisClubMembershipEvent, version: 'v1' }
    ])

    expect(backfilled).toBe(0)
  })
})
