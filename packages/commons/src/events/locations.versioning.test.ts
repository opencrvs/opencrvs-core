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

import { createPrng, generateUuid } from './test.utils'
import { toPlainDate } from './PlainDate'
import {
  AdministrativeArea,
  isSelectableAtAnchor,
  Location,
  LocationVersion,
  resolvePath,
  resolveVersion,
  toClientAdministrativeArea,
  toClientLocation
} from './locations'

const rng = createPrng(4242)

function version(
  effectiveFrom: string,
  name: string,
  status: 'active' | 'inactive' = 'active'
): LocationVersion {
  return {
    versionId: generateUuid(),
    effectiveFrom,
    name,
    externalId: null,
    status
  }
}

const versionedProvince: AdministrativeArea = {
  id: generateUuid(rng),
  name: 'Greater Pangasinan',
  externalId: null,
  parentId: null,
  status: 'active',
  versions: [
    version('0001-01-01', 'Pangasinan'),
    version('2010-01-01', 'Greater Pangasinan')
  ]
}

const versionedDistrict: AdministrativeArea = {
  id: generateUuid(rng),
  name: 'Alaminos City',
  externalId: null,
  parentId: versionedProvince.id,
  status: 'inactive',
  versions: [
    version('0001-01-01', 'Alaminos'),
    version('2005-03-28', 'Alaminos City'),
    version('2020-01-01', 'Alaminos City', 'inactive')
  ]
}

const versionedOffice: Location = {
  id: generateUuid(rng),
  name: 'Alaminos City Registry Office',
  externalId: null,
  administrativeAreaId: versionedDistrict.id,
  locationType: 'CRVS_OFFICE',
  status: 'active',
  versions: [
    version('0001-01-01', 'Alaminos Registry'),
    version('2008-06-01', 'Alaminos City Registry Office')
  ]
}

const standaloneOffice: Location = {
  id: generateUuid(rng),
  name: 'Standalone Office',
  externalId: null,
  administrativeAreaId: null,
  locationType: 'CRVS_OFFICE',
  status: 'active',
  versions: [version('0001-01-01', 'Standalone Office')]
}

const context = {
  administrativeAreas: new Map([
    [versionedProvince.id, versionedProvince],
    [versionedDistrict.id, versionedDistrict]
  ]),
  locations: new Map([
    [versionedOffice.id, versionedOffice],
    [standaloneOffice.id, standaloneOffice]
  ])
}

describe('resolveVersion', () => {
  const versions = [
    version('0001-01-01', 'Alaminos'),
    version('2005-03-28', 'Alaminos City'),
    version('2020-01-01', 'Alaminos City', 'inactive')
  ]

  it('returns the version with the greatest effectiveFrom ≤ anchor', () => {
    expect(resolveVersion(versions, '2010-06-15').name).toBe('Alaminos City')
    expect(resolveVersion(versions, '2010-06-15').status).toBe('active')
  })

  it('treats an anchor equal to effectiveFrom as within that version', () => {
    expect(resolveVersion(versions, '2005-03-28').name).toBe('Alaminos City')
  })

  it('returns the last version for anchors after all versions', () => {
    expect(resolveVersion(versions, '2030-01-01').status).toBe('inactive')
  })

  it('returns the earliest version when the anchor precedes all versions', () => {
    const late = [
      version('1990-01-01', 'Founded Town'),
      version('2000-01-01', 'Renamed Town')
    ]
    expect(resolveVersion(late, '1980-01-01').name).toBe('Founded Town')
  })

  it('resolves a single sentinel-dated version at any anchor', () => {
    const single = [version('0001-01-01', 'Only Name')]
    expect(resolveVersion(single, '1970-01-01').name).toBe('Only Name')
    expect(resolveVersion(single, '2099-12-31').name).toBe('Only Name')
  })
})

describe('isSelectableAtAnchor', () => {
  const versions = [
    version('0001-01-01', 'Alaminos'),
    version('2005-03-28', 'Alaminos City'),
    version('2020-01-01', 'Alaminos City', 'inactive')
  ]

  it('is selectable when the resolved version at the anchor is active', () => {
    expect(isSelectableAtAnchor(versions, '2010-06-15')).toBe(true)
  })

  it('is not selectable when the resolved version at the anchor is inactive', () => {
    expect(isSelectableAtAnchor(versions, '2021-01-01')).toBe(false)
  })

  it('is not selectable when the anchor precedes every version — the location did not exist yet', () => {
    // resolveVersion alone would fall back to the earliest ('Founded Town',
    // active) and wrongly call this selectable; isSelectableAtAnchor must
    // also require a version actually effective by the anchor.
    const createdLater = [
      version('1990-01-01', 'Founded Town'),
      version('2000-01-01', 'Renamed Town')
    ]
    expect(isSelectableAtAnchor(createdLater, '1980-01-01')).toBe(false)
    expect(resolveVersion(createdLater, '1980-01-01').status).toBe('active')
  })

  it('treats an anchor equal to effectiveFrom as within that version', () => {
    expect(isSelectableAtAnchor(versions, '0001-01-01')).toBe(true)
  })
})

describe('resolvePath', () => {
  it('resolves the whole path, leaf included, at an anchor before any change', () => {
    expect(
      resolvePath(versionedOffice.id, toPlainDate('1995-05-20'), context)
    ).toEqual([
      { id: versionedProvince.id, name: 'Pangasinan', status: 'active' },
      { id: versionedDistrict.id, name: 'Alaminos', status: 'active' },
      { id: versionedOffice.id, name: 'Alaminos Registry', status: 'active' }
    ])
  })

  it('resolves the whole path at an anchor after all changes', () => {
    expect(
      resolvePath(versionedOffice.id, toPlainDate('2021-06-01'), context)
    ).toEqual([
      {
        id: versionedProvince.id,
        name: 'Greater Pangasinan',
        status: 'active'
      },
      { id: versionedDistrict.id, name: 'Alaminos City', status: 'inactive' },
      {
        id: versionedOffice.id,
        name: 'Alaminos City Registry Office',
        status: 'active'
      }
    ])
  })

  it('resolves each ancestor independently at a mid-history anchor', () => {
    expect(
      resolvePath(versionedOffice.id, toPlainDate('2006-01-01'), context).map(
        (n) => n.name
      )
    ).toEqual(['Pangasinan', 'Alaminos City', 'Alaminos Registry'])
  })

  it('keeps an inactivated node resolvable with its status exposed', () => {
    const district = resolvePath(
      versionedDistrict.id,
      toPlainDate('2021-01-01'),
      context
    )
    expect(district).toEqual([
      {
        id: versionedProvince.id,
        name: 'Greater Pangasinan',
        status: 'active'
      },
      { id: versionedDistrict.id, name: 'Alaminos City', status: 'inactive' }
    ])
  })

  it('returns an areas-only path for an administrative area id', () => {
    expect(
      resolvePath(versionedDistrict.id, toPlainDate('1999-01-01'), context).map(
        (n) => n.id
      )
    ).toEqual([versionedProvince.id, versionedDistrict.id])
  })

  it('returns only the leaf for a location without an administrative area', () => {
    expect(
      resolvePath(standaloneOffice.id, toPlainDate('2020-01-01'), context)
    ).toEqual([
      { id: standaloneOffice.id, name: 'Standalone Office', status: 'active' }
    ])
  })

  it('returns an empty path for an unknown id', () => {
    expect(
      resolvePath(generateUuid(rng), toPlainDate('2020-01-01'), context)
    ).toEqual([])
  })

  it('accepts stripped client maps', () => {
    const clientContext = {
      administrativeAreas: new Map(
        [versionedProvince, versionedDistrict].map((a) => [
          a.id,
          toClientAdministrativeArea(a)
        ])
      ),
      locations: new Map(
        [versionedOffice, standaloneOffice].map((l) => [
          l.id,
          toClientLocation(l)
        ])
      )
    }
    expect(
      resolvePath(
        versionedOffice.id,
        toPlainDate('1995-05-20'),
        clientContext
      ).map((n) => n.name)
    ).toEqual(['Pangasinan', 'Alaminos', 'Alaminos Registry'])
  })
})

describe('toClientLocation / toClientAdministrativeArea', () => {
  it('strips the server-flattened fields from a location', () => {
    const stripped = toClientLocation(versionedOffice)
    expect(stripped).toEqual({
      id: versionedOffice.id,
      administrativeAreaId: versionedOffice.administrativeAreaId,
      locationType: versionedOffice.locationType,
      versions: versionedOffice.versions
    })
  })

  it('strips the server-flattened fields from an administrative area', () => {
    const stripped = toClientAdministrativeArea(versionedDistrict)
    expect(stripped).toEqual({
      id: versionedDistrict.id,
      parentId: versionedDistrict.parentId,
      versions: versionedDistrict.versions
    })
  })
})
