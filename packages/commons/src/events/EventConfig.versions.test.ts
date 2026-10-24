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
import { tennisClubMembershipEvent } from '../fixtures'
import {
  getEventConfigForRecord,
  getEventConfigOfVersion,
  resolveEffectiveVersion,
  VersionedEventConfig
} from './EventConfig'
import { toVersionedEventConfig } from './test.utils'

const { versions, ...eventLevel } = toVersionedEventConfig(
  tennisClubMembershipEvent
)
const [base] = versions

// Listed out of date order: resolution must not depend on the order of the list.
const config: VersionedEventConfig = {
  ...eventLevel,
  versions: [
    { ...base, id: 'v2', effectiveFrom: '2020-01-01' },
    { ...base, id: 'v1' },
    { ...base, id: 'v3', effectiveFrom: '2030-01-01' }
  ]
}

describe('resolveEffectiveVersion()', () => {
  it('returns the version with the latest effectiveFrom not after the date', () => {
    expect(
      resolveEffectiveVersion(config, new Date('2025-06-01T10:00:00.000Z'))?.id
    ).toBe('v2')
  })

  it('includes a version taking effect on the date itself', () => {
    expect(
      resolveEffectiveVersion(config, new Date('2030-01-01T00:00:00.000Z'))?.id
    ).toBe('v3')
  })

  it('treats a version without effectiveFrom as effective from the beginning of time', () => {
    expect(
      resolveEffectiveVersion(config, new Date('1990-01-01T00:00:00.000Z'))?.id
    ).toBe('v1')
  })

  it('returns undefined when every version takes effect later', () => {
    const datedOnly = { ...config, versions: config.versions.slice(0, 1) }
    expect(
      resolveEffectiveVersion(datedOnly, new Date('2019-01-01T00:00:00.000Z'))
    ).toBeUndefined()
  })
})

describe('getEventConfigOfVersion()', () => {
  it('returns the configuration of the version with the id', () => {
    expect(getEventConfigOfVersion(config, 'v2')).toBe(
      getEventConfigForRecord(config, { configVersionId: 'v2' })
    )
  })

  it('throws, naming the event and the id, when the version is not configured', () => {
    expect(() => getEventConfigOfVersion(config, 'v9')).toThrow(
      `Event '${config.id}' has no version 'v9'`
    )
  })
})

describe('getEventConfigForRecord()', () => {
  it('uses the version the record is stamped with, even when newer ones are in effect', () => {
    expect(getEventConfigForRecord(config, { configVersionId: 'v1' })).toBe(
      getEventConfigOfVersion(config, 'v1')
    )
  })

  it('uses the earliest version for a record created before versioning', () => {
    expect(getEventConfigForRecord(config, {})).toBe(
      getEventConfigOfVersion(config, 'v1')
    )
  })

  it('gives the same configuration object for the same version', () => {
    const record = { configVersionId: 'v2' }
    expect(getEventConfigForRecord(config, record)).toBe(
      getEventConfigForRecord(config, record)
    )
  })
})
