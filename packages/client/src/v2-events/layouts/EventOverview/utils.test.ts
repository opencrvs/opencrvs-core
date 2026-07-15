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

import { describe, it, expect } from 'vitest'
import {
  AdministrativeArea,
  EventIndex,
  Location,
  UUID
} from '@opencrvs/commons/client'
import { buildEventIndexWithHierarchy } from './utils'

function mockVersionFields(id: UUID, name: string) {
  return {
    status: 'active' as const,
    effectiveFrom: '0001-01-01',
    versions: [
      {
        versionId: id,
        effectiveFrom: '0001-01-01',
        name,
        externalId: null,
        status: 'active' as const
      }
    ]
  }
}

const province: AdministrativeArea = {
  id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' as UUID,
  name: 'Province',
  externalId: null,
  parentId: null,
  ...mockVersionFields(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' as UUID,
    'Province'
  )
}

const district: AdministrativeArea = {
  id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb' as UUID,
  name: 'District',
  externalId: null,
  parentId: province.id,
  ...mockVersionFields(
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb' as UUID,
    'District'
  )
}

const office: Location = {
  id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc' as UUID,
  name: 'District Office',
  externalId: null,
  administrativeAreaId: district.id,
  locationType: 'CRVS_OFFICE',
  ...mockVersionFields(
    'cccccccc-cccc-4ccc-cccc-cccccccccccc' as UUID,
    'District Office'
  )
}

const officeWithoutArea: Location = {
  id: 'dddddddd-dddd-4ddd-dddd-dddddddddddd' as UUID,
  name: 'Standalone Office',
  externalId: null,
  administrativeAreaId: null,
  locationType: 'CRVS_OFFICE',
  ...mockVersionFields(
    'dddddddd-dddd-4ddd-dddd-dddddddddddd' as UUID,
    'Standalone Office'
  )
}

function buildMaps() {
  const administrativeAreas = new Map<UUID, AdministrativeArea>([
    [province.id, province],
    [district.id, district]
  ])
  const locations = new Map<UUID, Location>([
    [office.id, office],
    [officeWithoutArea.id, officeWithoutArea]
  ])
  return { administrativeAreas, locations }
}

function makeEventIndex(overrides: Partial<EventIndex> = {}): EventIndex {
  const now = new Date().toISOString()
  return {
    id: 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee' as UUID,
    type: 'BIRTH',
    status: 'CREATED',
    createdAt: now,
    updatedAt: now,
    createdBy: 'user-1',
    createdAtLocation: office.id,
    updatedAtLocation: office.id,
    placeOfEvent: district.id,
    trackingId: 'ABC123',
    declaration: {},
    legalStatuses: {
      DECLARED: undefined,
      REGISTERED: undefined
    },
    ...overrides
  } as EventIndex
}

describe('buildEventIndexWithHierarchy', () => {
  it('expands createdAtLocation and updatedAtLocation to hierarchies', () => {
    const event = makeEventIndex()
    const result = buildEventIndexWithHierarchy(event, buildMaps())

    expect(result.createdAtLocation).toEqual([
      province.id,
      district.id,
      office.id
    ])
    expect(result.updatedAtLocation).toEqual([
      province.id,
      district.id,
      office.id
    ])
  })

  it('expands placeOfEvent to hierarchy', () => {
    const event = makeEventIndex({ placeOfEvent: district.id })
    const result = buildEventIndexWithHierarchy(event, buildMaps())

    expect(result.placeOfEvent).toEqual([province.id, district.id])
  })

  it('handles null/undefined location fields gracefully', () => {
    const event = makeEventIndex({
      createdAtLocation: null,
      updatedAtLocation: undefined,
      placeOfEvent: undefined
    })
    const result = buildEventIndexWithHierarchy(event, buildMaps())

    expect(result.createdAtLocation).toEqual([])
    expect(result.updatedAtLocation).toEqual([])
    expect(result.placeOfEvent).toBeUndefined()
  })

  it('expands legalStatuses.DECLARED.createdAtLocation', () => {
    const event = makeEventIndex({
      legalStatuses: {
        DECLARED: {
          createdAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
          createdBy: 'user-1',
          createdAtLocation: office.id
        },
        REGISTERED: undefined
      }
    })
    const result = buildEventIndexWithHierarchy(event, buildMaps())

    expect(result.legalStatuses.DECLARED?.createdAtLocation).toEqual([
      province.id,
      district.id,
      office.id
    ])
  })

  it('expands legalStatuses.REGISTERED.createdAtLocation', () => {
    const event = makeEventIndex({
      legalStatuses: {
        DECLARED: undefined,
        REGISTERED: {
          createdAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
          createdBy: 'user-1',
          createdAtLocation: office.id,
          registrationNumber: 'REG-001'
        }
      }
    })
    const result = buildEventIndexWithHierarchy(event, buildMaps())

    expect(result.legalStatuses.REGISTERED?.createdAtLocation).toEqual([
      province.id,
      district.id,
      office.id
    ])
  })

  it('preserves undefined legalStatuses entries', () => {
    const event = makeEventIndex()
    const result = buildEventIndexWithHierarchy(event, buildMaps())

    expect(result.legalStatuses.DECLARED).toBeUndefined()
    expect(result.legalStatuses.REGISTERED).toBeUndefined()
  })
})
