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

describe('for user with read organisation in my jurisdiction scope', () => {
  let store: AppStore

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes([SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION], store)
  })

  it('link should be enabled if office is under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: '7a18cb4c-38f3-449f-b3dc-508473d485f3'
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Moktarpur Union Parishad' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })

  it('link should be disabled if office is not under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b'
        })
      ]
    })
    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Dhaka Union Parishad' })
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
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: '7a18cb4c-38f3-449f-b3dc-508473d485f3'
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Moktarpur Union Parishad' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })

  it('link should be enabled even if office is not under jurisdiction', async () => {
    const userOfficeId = 'da672661-eb0a-437b-aa7a-a6d9a1711dd1'

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b'
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Dhaka Union Parishad' })
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
    const userOfficeId = '0d8474da-0361-4d32-979e-af91f012340a'

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: '7a18cb4c-38f3-449f-b3dc-508473d485f3'
        })
      ]
    })

    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()
    expect(
      component
        .find({ children: 'Moktarpur Union Parishad' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(false)
  })

  it('link should be disabled for other offices', async () => {
    const userOfficeId = '0d8474da-0361-4d32-979e-af91f012340a'

    const { component } = await createTestComponent(<AdministrativeLevels />, {
      store,
      path: ORGANISATIONS_INDEX,
      initialEntries: [
        formatUrl(ORGANISATIONS_INDEX, {
          locationId: '5926982b-845c-4463-80aa-cbfb86762e0a'
        })
      ]
    })
    store.dispatch(
      setUserDetails({
        loading: false,
        data: fetchUserMock(userOfficeId),
        networkStatus: NetworkStatus.ready
      })
    )
    component.update()

    expect(
      component
        .find({ children: 'Comilla Union Parishad' })
        .hostNodes()
        .first()
        .prop('disabled')
    ).toBe(true)
  })
})
