/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent } from '@client/tests/util'
import { AdvancedSearchConfig } from './AdvancedSearch'
import { createStore } from '@client/store'
import { waitForElement } from '@client/tests/wait-for-element'

let testComponent: ReactWrapper
beforeEach(async () => {
  const { store, history } = createStore()

  testComponent = await createTestComponent(
    <AdvancedSearchConfig></AdvancedSearchConfig>,
    { store, history }
  )
  testComponent.update()
})

describe('should render both birth and death tabs', () => {
  it('should shows birth, and death tab button', async () => {
    expect(testComponent.find('#tab_birth').hostNodes().text()).toBe('Birth')
    expect(testComponent.find('#tab_death').hostNodes().text()).toBe('Death')
  })
})

describe('should open birth tab by default', () => {
  it('render registration details accordion', async () => {
    expect(
      testComponent.find('#BirthRegistrationDetails-accordion').hostNodes()
        .length
    ).toBe(1)
  })

  it('should open the accordion when clicked on it', async () => {
    testComponent
      .find('#BirthRegistrationDetails-accordion-header')
      .hostNodes()
      .simulate('click')
    await waitForElement(testComponent, '#BirthRegistrationDetails-content')
  })
})
