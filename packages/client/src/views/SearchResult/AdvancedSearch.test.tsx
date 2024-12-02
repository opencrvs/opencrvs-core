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
import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createRouterProps, createTestComponent } from '@client/tests/util'
import { AdvancedSearchConfig } from './AdvancedSearch'
import { createStore } from '@client/store'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { formatUrl } from '@client/navigation'
import {
  ADVANCED_SEARCH,
  ADVANCED_SEARCH_RESULT
} from '@client/navigation/routes'
import { createMemoryRouter } from 'react-router-dom'

let testComponent: ReactWrapper
let testRouter: ReturnType<typeof createMemoryRouter>
beforeEach(async () => {
  const { store } = createStore()
  const component = await createTestComponent(
    // @ts-ignore
    <AdvancedSearchConfig
      {...createRouterProps(formatUrl(ADVANCED_SEARCH, {}), {
        isNavigatedInsideApp: false
      })}
    ></AdvancedSearchConfig>,
    {
      store,
      initialEntries: [
        { pathname: ADVANCED_SEARCH, state: { isNavigatedInsideApp: false } }
      ]
    }
  )
  testComponent = component.component
  testRouter = component.router
  testComponent.update()
})

describe('should render both birth and death tabs', () => {
  it('should shows birth, and death tab button', async () => {
    expect(testComponent.find('#tab_birth').hostNodes().text()).toBe('Birth')
    expect(testComponent.find('#tab_death').hostNodes().text()).toBe('Death')
  })
})

describe('when advancedSearchPage renders with no active params in store', () => {
  it('renders searchbutton as disabled', async () => {
    expect(
      testComponent.find('#search').hostNodes().props().disabled
    ).toBeTruthy()
  })
  it('renders all accordions as closed', async () => {
    expect(
      testComponent.find('#BirthRegistrationDetails-content').hostNodes().length
    ).toBe(0)
  })
})

describe('when advancedSearchPage renders with 2 or more active params in store', () => {
  let testComponent: ReactWrapper
  let testRouter: ReturnType<typeof createMemoryRouter>
  beforeEach(async () => {
    const { store } = createStore()
    store.dispatch(
      setAdvancedSearchParam({
        event: 'birth',
        declarationLocationId: '0d8474da-0361-4d32-979e-af91f012340a',
        registrationStatuses: ['IN_PROGRESS']
      })
    )
    const component = await createTestComponent(
      <AdvancedSearchConfig></AdvancedSearchConfig>,
      {
        store
      }
    )

    testComponent = component.component
    testRouter = component.router

    testComponent.update()
  })

  it('renders searchbutton as enabled', async () => {
    expect(
      testComponent.find('#search').hostNodes().props().disabled
    ).toBeFalsy()
  })

  it('renders accordions with active params as opened', async () => {
    expect(
      testComponent.find('#BirthRegistrationDetails-content').hostNodes().length
    ).toBe(1)
  })

  it('goes to advancedSearch Result page if search button is clicked', async () => {
    testComponent.find('#search').hostNodes().simulate('click')
    expect(testRouter.state.location.pathname).toContain(
      `${ADVANCED_SEARCH_RESULT}`
    )
  })
})
