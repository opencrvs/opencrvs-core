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
import { toVersionedEventConfig, VersionedEventConfig } from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { resolveVersionForNewRecord } from './configVersion'

const { versions, ...eventLevel } = toVersionedEventConfig(
  tennisClubMembershipEvent
)
const [base] = versions

const config: VersionedEventConfig = {
  ...eventLevel,
  versions: [
    { ...base, id: 'v1', effectiveFrom: '2020-01-01' },
    { ...base, id: 'v2', effectiveFrom: '2030-01-01' }
  ]
}

describe('resolveVersionForNewRecord()', () => {
  it('uses the version in effect when the client chose none', () => {
    expect(
      resolveVersionForNewRecord(
        config,
        undefined,
        new Date('2025-06-01T10:00:00.000Z'),
        'UTC'
      ).id
    ).toBe('v1')
  })

  it("takes effect at midnight in the country's time zone, not UTC", () => {
    // 2029-12-31T20:00Z is already 2030-01-01 in Dhaka (UTC+6).
    const lateEvening = new Date('2029-12-31T20:00:00.000Z')
    expect(
      resolveVersionForNewRecord(config, undefined, lateEvening, 'UTC').id
    ).toBe('v1')
    expect(
      resolveVersionForNewRecord(config, undefined, lateEvening, 'Asia/Dhaka')
        .id
    ).toBe('v2')
  })

  it('rejects with 409, naming the date, when the client chose none and none is in effect', () => {
    expect(() =>
      resolveVersionForNewRecord(
        config,
        undefined,
        new Date('2019-06-01T10:00:00.000Z'),
        'UTC'
      )
    ).toThrow(
      expect.objectContaining({
        code: 'CONFLICT',
        message: `Event '${config.id}' has no version in effect on 2019-06-01`
      })
    )
  })

  it('accepts a version taking effect a few minutes from now, as the client clock may be ahead', () => {
    expect(
      resolveVersionForNewRecord(
        config,
        'v2',
        new Date('2029-12-31T23:58:00.000Z'),
        'UTC'
      ).id
    ).toBe('v2')
  })

  it('rejects with 400 a version taking effect beyond clock drift', () => {
    expect(() =>
      resolveVersionForNewRecord(
        config,
        'v2',
        new Date('2029-12-31T23:50:00.000Z'),
        'UTC'
      )
    ).toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
        message: `Version 'v2' of event '${config.id}' takes effect on 2030-01-01, in the future`
      })
    )
  })
})
