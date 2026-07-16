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

import { generateUuid } from './test.utils'
import {
  CreateLocationPayload,
  UpdateAdministrativeAreaPayload,
  UpdateLocationPayload
} from './locations'

describe('location write payloads', () => {
  const locationId = generateUuid(() => 0.91)
  const lastVersionId = generateUuid(() => 0.92)

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
