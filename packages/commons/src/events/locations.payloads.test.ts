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

import { generateUuid, locationVersion } from './test.utils'
import {
  CreateLocationPayload,
  UpdateAdministrativeAreaPayload,
  UpdateLocationPayload
} from './locationPayloads'
import { SetAdministrativeAreaPayload, SetLocationPayload } from './locations'
import { UUID } from '../uuid'

describe('location write payloads', () => {
  const locationId = generateUuid(() => 0.91)
  const lastVersionId = generateUuid(() => 0.92)
  const areaId = generateUuid(() => 0.94)

  it('CreateLocationPayload defaults status to active and accepts a plain-date effectiveFrom', () => {
    const parsed = CreateLocationPayload.parse({
      name: 'New Office',
      externalId: 'new-office-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2026-01-01'
    })

    expect(parsed.status).toBe('active')
    expect(parsed.effectiveFrom).toBe('2026-01-01')
  })

  it('CreateLocationPayload rejects a datetime effectiveFrom', () => {
    const result = CreateLocationPayload.safeParse({
      name: 'New Office',
      externalId: null,
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2026-01-01T00:00:00Z'
    })

    expect(result.success).toBe(false)
  })

  it('UpdateLocationPayload requires the full versioned snapshot', () => {
    const result = UpdateLocationPayload.safeParse({
      id: locationId,
      lastVersionId,
      // name missing — a partial diff is not a valid update
      status: 'active'
    })

    expect(result.success).toBe(false)
  })

  it('UpdateLocationPayload rejects identity fields instead of ignoring them', () => {
    const result = UpdateLocationPayload.safeParse({
      id: locationId,
      lastVersionId,
      name: 'Renamed Office',
      externalId: null,
      status: 'active',
      administrativeAreaId: generateUuid(() => 0.93)
    })

    expect(result.success).toBe(false)
  })

  it('UpdateLocationPayload rejects locationType', () => {
    const result = UpdateLocationPayload.safeParse({
      id: locationId,
      lastVersionId,
      name: 'Renamed Office',
      externalId: null,
      status: 'active',
      locationType: 'HEALTH_FACILITY'
    })

    expect(result.success).toBe(false)
  })

  it('UpdateLocationPayload requires lastVersionId', () => {
    const result = UpdateLocationPayload.safeParse({
      id: locationId,
      name: 'Renamed Office',
      externalId: null,
      status: 'active'
    })

    expect(result.success).toBe(false)
  })

  describe.each([
    {
      label: 'SetLocationPayload',
      identity: {
        id: locationId,
        name: 'Ilanga Office',
        externalId: 'ilanga-office-pcode',
        administrativeAreaId: null,
        locationType: 'CRVS_OFFICE'
      },
      safeParse: (payload: unknown) => SetLocationPayload.safeParse(payload)
    },
    {
      label: 'SetAdministrativeAreaPayload',
      identity: {
        id: areaId,
        name: 'Ilanga District',
        externalId: 'ilanga-district-pcode',
        parentId: null
      },
      safeParse: (payload: unknown) =>
        SetAdministrativeAreaPayload.safeParse(payload)
    }
  ])('$label versions', ({ identity, safeParse }) => {
    const versionA = generateUuid(() => 0.2)
    const versionB = generateUuid(() => 0.4)

    const version = (versionId: UUID, effectiveFrom: string) =>
      locationVersion({
        versionId,
        effectiveFrom,
        name: identity.name,
        externalId: identity.externalId
      })

    it('accepts a payload with no versions', () => {
      const result = safeParse(identity)

      expect(result.success).toBe(true)
      expect(result.data?.versions).toBeUndefined()
    })

    it('accepts a strictly ascending multi-element history', () => {
      const result = safeParse({
        ...identity,
        versions: [
          version(versionA, '0001-01-01'),
          version(versionB, '2019-04-02')
        ]
      })

      expect(result.success).toBe(true)
      expect(result.data?.versions).toHaveLength(2)
    })

    it('rejects an empty history', () => {
      const result = safeParse({
        ...identity,
        versions: []
      })

      expect(result.success).toBe(false)
    })

    it('rejects a descending history', () => {
      const result = safeParse({
        ...identity,
        versions: [
          version(versionA, '2019-04-02'),
          version(versionB, '0001-01-01')
        ]
      })

      expect(result.success).toBe(false)
    })

    it('rejects two versions sharing an effectiveFrom', () => {
      const result = safeParse({
        ...identity,
        versions: [
          version(versionA, '2019-04-02'),
          version(versionB, '2019-04-02')
        ]
      })

      expect(result.success).toBe(false)
    })

    it('rejects a repeated versionId, which would make lastVersionId ambiguous', () => {
      const result = safeParse({
        ...identity,
        versions: [
          version(versionA, '0001-01-01'),
          version(versionA, '2019-04-02')
        ]
      })

      expect(result.success).toBe(false)
    })
  })

  it('UpdateAdministrativeAreaPayload rejects parentId', () => {
    const result = UpdateAdministrativeAreaPayload.safeParse({
      id: locationId,
      lastVersionId,
      name: 'Renamed District',
      externalId: null,
      status: 'active',
      parentId: null
    })

    expect(result.success).toBe(false)
  })
})
