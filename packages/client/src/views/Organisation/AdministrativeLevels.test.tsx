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
import { NetworkStatus } from '@apollo/client'
import { AppStore, createStore } from '@client/store'
import {
  setScopes,
  createTestComponent,
  fetchUserMock
} from '@client/tests/util'
import { SCOPES } from '@opencrvs/commons/client'
import { AdministrativeLevels } from './AdministrativeLevels'
import { setUserDetails } from '@client/profile/profileActions'
import { ORGANISATIONS_INDEX } from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import {
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@client/tests/v2-events/administrative-hierarchy-mock'

describe('for user with read organisation in my jurisdiction scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION], store)
  })

  it('link should be enabled if office is under jurisdiction', async () => {
    const centralProvincialOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Central Provincial Office'
    )

    const ibomboDistrict = V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS.find(
      (location) => location.name === 'Ibombo'
    )

    if (!centralProvincialOffice || !ibomboDistrict) {
      throw new Error('Required mock locations not found')
    }

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: ibomboDistrict.id
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(centralProvincialOffice.id),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Ibombo District Office' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })

  it('link should be disabled if office is not under jurisdiction', async () => {
    const centralProvincialOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Central Provincial Office'
    )
    const ilangaDistrict = V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS.find(
      (location) => location.name === 'Ilanga'
    )

    if (!centralProvincialOffice || !ilangaDistrict) {
      throw new Error('Required mock locations not found')
    }

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: ilangaDistrict.id
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(centralProvincialOffice.id),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Ilanga District Office' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(true)
  })
})

describe('for user with read organisation scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.ORGANISATION_READ_LOCATIONS], store)
  })

  it('link should be enabled if office is under jurisdiction', async () => {
    const centralProvincialOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Central Provincial Office'
    )
    const ibomboDistrict = V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS.find(
      (location) => location.name === 'Ibombo'
    )

    if (!centralProvincialOffice || !ibomboDistrict) {
      throw new Error('Required mock locations not found')
    }

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: ibomboDistrict.id
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(centralProvincialOffice.id),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Ibombo District Office' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })

  it('link should be enabled even if office is not under jurisdiction', async () => {
    const centralProvincialOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Central Provincial Office'
    )
    const ilangaDistrict = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Ilanga'
    )

    if (!centralProvincialOffice || !ilangaDistrict) {
      throw new Error('Required mock locations not found')
    }

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: ilangaDistrict.id
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(centralProvincialOffice.id),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Ilanga District Office' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })
})

describe('for user with read organisation my office scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE], store)
  })

  it("link should be enabled if user's office", async () => {
    const ibomboDistrictOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Ibombo District Office'
    )
    const ibomboDistrict = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Ibombo'
    )

    if (!ibomboDistrictOffice || !ibomboDistrict) {
      throw new Error('Required mock locations not found')
    }

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: ibomboDistrict.id
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(ibomboDistrictOffice.id),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Ibombo District Office' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })

  it('link should be disabled for other offices', async () => {
    const ibomboDistrictOffice = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Ibombo District Office'
    )
    const isangoDistrict = V2_DEFAULT_MOCK_LOCATIONS.find(
      (location) => location.name === 'Isango'
    )

    if (!ibomboDistrictOffice || !isangoDistrict) {
      throw new Error('Required mock locations not found')
    }

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: isangoDistrict.id
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(ibomboDistrictOffice.id),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Isango District Office' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(true)
  })
})
