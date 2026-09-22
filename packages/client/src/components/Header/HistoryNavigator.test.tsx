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
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { HistoryNavigator } from './HistoryNavigator'

describe('HistoryNavigator', () => {
  it('renders both the back and the forward button', async () => {
    const { store } = createStore()
    const { component } = await createTestComponent(<HistoryNavigator />, {
      store
    })

    expect(component.find('#header-go-back-button').hostNodes()).toHaveLength(1)
    expect(
      component.find('#header-go-forward-button').hostNodes()
    ).toHaveLength(1)
  })

  it('renders only the back button when the forward button is hidden', async () => {
    const { store } = createStore()
    const { component } = await createTestComponent(
      <HistoryNavigator hideForward />,
      { store }
    )

    expect(component.find('#header-go-back-button').hostNodes()).toHaveLength(1)
    expect(
      component.find('#header-go-forward-button').hostNodes()
    ).toHaveLength(0)
  })
})
