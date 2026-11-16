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
import { describe, expect, it } from 'vitest'
import { getDeclaredOffices, LocationRead, parseLocations } from './locations'

function area(overrides: Record<string, unknown> = {}) {
  return { id: 'ibombo', name: 'Ibombo', partOf: 'Location/0', ...overrides }
}

function location(overrides: Record<string, unknown> = {}) {
  return {
    id: 'HPGiE9Jjh2r',
    name: 'Ibombo District Office',
    partOf: 'Location/ibombo',
    locationType: 'CRVS_OFFICE',
    ...overrides
  }
}

function hierarchy(
  administrativeAreas: unknown[],
  locations: unknown[]
): Extract<LocationRead, { readable: true }> {
  const read = parseLocations({ administrativeAreas, locations })

  if (!read.readable) {
    throw new Error('expected the hierarchy to be readable')
  }

  return read
}

describe('a document that did not parse', () => {
  it('is one problem about the hierarchy, and declares no office', () => {
    const parsed = parseLocations({ locations: [] })

    expect(parsed.readable).toBe(false)
    expect(parsed.readable === false && parsed.problem.kind).toBe(
      'hierarchyUnparsed'
    )
    expect(getDeclaredOffices(parsed).size).toBe(0)
  })

  it('is what an unrecognised field gets, rather than having it dropped', () => {
    // A misspelled `verisons` would otherwise cost a location its whole
    // history without a word.
    expect(
      parseLocations({
        administrativeAreas: [area()],
        locations: [location({ verisons: [] })]
      }).readable
    ).toBe(false)
  })
})

describe('a node at the root of the hierarchy', () => {
  it('is no problem: the root is the one parent nothing has to declare', () => {
    expect(hierarchy([area({ partOf: 'Location/0' })], []).problems).toEqual([])
  })
})

describe('an administrative area whose parent is not declared', () => {
  it('is a problem naming the area and what it claims to be part of', () => {
    expect(
      hierarchy([area({ partOf: 'Location/central' })], []).problems
    ).toEqual([
      {
        kind: 'unparentedNode',
        node: { place: 'administrativeArea', id: 'ibombo', name: 'Ibombo' },
        partOf: 'Location/central'
      }
    ])
  })
})

describe('a location whose parent is not a declared administrative area', () => {
  it('is a problem when the area does not exist', () => {
    expect(
      hierarchy([area()], [location({ partOf: 'Location/atlantis' })]).problems
    ).toEqual([
      {
        kind: 'unparentedNode',
        node: {
          place: 'location',
          id: 'HPGiE9Jjh2r',
          name: 'Ibombo District Office'
        },
        partOf: 'Location/atlantis'
      }
    ])
  })

  it('is a problem when it names another location, since only areas are parents', () => {
    expect(
      hierarchy(
        [area()],
        [
          location({ id: 'office' }),
          location({ id: 'annex', name: 'Annex', partOf: 'Location/office' })
        ]
      ).problems
    ).toMatchObject([{ node: { id: 'annex' } }])
  })
})

describe('the offices the seed-data declares', () => {
  it("are its locations, by the country config's own ids", () => {
    expect([
      ...getDeclaredOffices(hierarchy([area()], [location()]))
    ]).toEqual(['HPGiE9Jjh2r'])
  })

  it('do not include administrative areas, which are written elsewhere', () => {
    expect(getDeclaredOffices(hierarchy([area()], [])).has('ibombo')).toBe(false)
  })
})

describe('the payload to write', () => {
  it("mint fresh ids and keep the country config's own as external ids", () => {
    const { payload } = hierarchy([area()], [location()])

    expect(payload.administrativeAreas[0]).toMatchObject({ externalId: 'ibombo' })
    expect(payload.locations[0]).toMatchObject({
      externalId: 'HPGiE9Jjh2r',
      administrativeAreaId: payload.administrativeAreas[0].id
    })
    expect(payload.locations[0].id).not.toBe('HPGiE9Jjh2r')
  })

  it('default a version with no effective date to the beginning of time', () => {
    const { payload } = hierarchy(
      [area({ versions: [{ name: 'Ibombo', status: 'active' }] })],
      []
    )

    expect(payload.administrativeAreas[0].versions).toMatchObject([
      { effectiveFrom: '0001-01-01', name: 'Ibombo', status: 'active' }
    ])
  })
})
