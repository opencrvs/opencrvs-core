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
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import {
  encodeScope,
  Scope,
  User,
  UUID,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
  V2_DEFAULT_MOCK_LOCATIONS_MAP
} from '@opencrvs/commons/client'

// Hierarchy used: Central (province) → Ibombo (district)
//                 Sulaka (province, separate root)
const CENTRAL_ADMIN_AREA_ID = 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID
const IBOMBO_ADMIN_AREA_ID = '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
const SULAKA_ADMIN_AREA_ID = 'c599b691-fd2d-45e1-abf4-d185de727fb5' as UUID

const CENTRAL_PROVINCIAL_OFFICE_ID =
  '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID
const IBOMBO_DISTRICT_OFFICE_ID = '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
const SULAKA_PROVINCIAL_OFFICE_ID =
  '2884f5b9-17b4-49ce-bf4d-f538228935df' as UUID

const CURRENT_USER_ID = '80ae6b57-be27-4803-94b4-609366d01fad' as UUID
const TARGET_USER_ID = 'ac0babf3-282a-447a-aecc-3b9aa9fb7cc5' as UUID

vi.mock('@client/v2-events/hooks/useLocations', () => ({
  useLocations: () => ({
    getLocations: {
      useSuspenseQuery: () => V2_DEFAULT_MOCK_LOCATIONS_MAP
    }
  })
}))

vi.mock('@client/v2-events/hooks/useAdministrativeAreas', () => ({
  useAdministrativeAreas: () => ({
    getAdministrativeAreas: {
      useSuspenseQuery: () => V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP
    }
  })
}))

function buildTargetUser(overrides: Partial<User> = {}): User {
  return {
    id: TARGET_USER_ID,
    name: { firstname: 'Target', surname: 'User' },
    role: 'FIELD_AGENT',
    primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID,
    administrativeAreaId: SULAKA_ADMIN_AREA_ID,
    type: 'user',
    status: 'active',
    signature: null,
    ...overrides
  } as unknown as User
}

const currentUser = {
  id: CURRENT_USER_ID,
  name: { firstname: 'Current', surname: 'User' },
  role: 'LOCAL_REGISTRAR',
  primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
  administrativeAreaId: CENTRAL_ADMIN_AREA_ID,
  type: 'user',
  status: 'active',
  signature: null
} as unknown as User

function makeWrapper({
  scopes,
  userDetails = currentUser
}: {
  scopes: Scope[]
  userDetails?: User | null
}) {
  const encoded = scopes.map(encodeScope)
  const store = configureStore({
    reducer: () => ({
      profile: {
        tokenPayload: { scope: encoded },
        userDetails
      }
    })
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

async function loadHook() {
  const mod = await import('./useAuthorization')
  return mod.usePermissions
}

describe('usePermissions().canEditUser — user.edit scope handling', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns false when current user is not loaded', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [{ type: 'user.edit', options: { accessLevel: 'all' } }],
        userDetails: null
      })
    })

    expect(result.current.canEditUser(buildTargetUser())).toBe(false)
  })

  it('returns false when no user.edit scope is granted', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [{ type: 'user.read', options: { accessLevel: 'all' } }]
      })
    })

    expect(result.current.canEditUser(buildTargetUser())).toBe(false)
  })

  it('returns true for any target when user.edit accessLevel is "all"', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [{ type: 'user.edit', options: { accessLevel: 'all' } }]
      })
    })

    expect(result.current.canEditUser(buildTargetUser())).toBe(true)
  })

  it('with accessLevel "location": allows targets in same primary office, blocks others', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [{ type: 'user.edit', options: { accessLevel: 'location' } }]
      })
    })

    expect(
      result.current.canEditUser(
        buildTargetUser({
          primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
          administrativeAreaId: CENTRAL_ADMIN_AREA_ID
        })
      )
    ).toBe(true)

    expect(
      result.current.canEditUser(
        buildTargetUser({
          primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID,
          administrativeAreaId: SULAKA_ADMIN_AREA_ID
        })
      )
    ).toBe(false)
  })

  it('with accessLevel "administrativeArea": allows descendants of current admin area, blocks unrelated areas', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [
          {
            type: 'user.edit',
            options: { accessLevel: 'administrativeArea' }
          }
        ]
      })
    })

    // Ibombo is a child of Central; current user sits at Central → access granted.
    expect(
      result.current.canEditUser(
        buildTargetUser({
          primaryOfficeId: IBOMBO_DISTRICT_OFFICE_ID,
          administrativeAreaId: IBOMBO_ADMIN_AREA_ID
        })
      )
    ).toBe(true)

    // Sulaka is a separate root; outside Central's hierarchy → access denied.
    expect(
      result.current.canEditUser(
        buildTargetUser({
          primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID,
          administrativeAreaId: SULAKA_ADMIN_AREA_ID
        })
      )
    ).toBe(false)
  })

  it('with role-restricted user.edit scope: allows only listed target roles', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [
          {
            type: 'user.edit',
            options: { accessLevel: 'all', role: ['FIELD_AGENT'] }
          }
        ]
      })
    })

    expect(
      result.current.canEditUser(buildTargetUser({ role: 'FIELD_AGENT' }))
    ).toBe(true)
    expect(
      result.current.canEditUser(buildTargetUser({ role: 'LOCAL_REGISTRAR' }))
    ).toBe(false)
  })

  it('with multiple user.edit scopes: combines permissions', async () => {
    const usePermissions = await loadHook()
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper({
        scopes: [
          {
            type: 'user.edit',
            options: { accessLevel: 'location', role: ['FIELD_AGENT'] }
          },
          {
            type: 'user.edit',
            options: {
              accessLevel: 'administrativeArea',
              role: ['POLICE_OFFICER']
            }
          }
        ]
      })
    })

    expect(
      result.current.canEditUser(buildTargetUser({ role: 'FIELD_AGENT' }))
    ).toBe(false)
    expect(
      result.current.canEditUser(
        buildTargetUser({
          role: 'FIELD_AGENT',
          primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
          administrativeAreaId: CENTRAL_ADMIN_AREA_ID
        })
      )
    ).toBe(true)
    expect(
      result.current.canEditUser(buildTargetUser({ role: 'POLICE_OFFICER' }))
    ).toBe(false)
    expect(
      result.current.canEditUser(
        buildTargetUser({
          role: 'POLICE_OFFICER',
          primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
          administrativeAreaId: CENTRAL_ADMIN_AREA_ID
        })
      )
    ).toBe(true)
    expect(
      result.current.canEditUser(buildTargetUser({ role: 'LOCAL_REGISTRAR' }))
    ).toBe(false)
    expect(
      result.current.canEditUser(
        buildTargetUser({
          role: 'LOCAL_REGISTRAR',
          primaryOfficeId: CENTRAL_PROVINCIAL_OFFICE_ID,
          administrativeAreaId: CENTRAL_ADMIN_AREA_ID
        })
      )
    ).toBe(false)
  })
})
