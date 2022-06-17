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
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'
import { Router } from 'react-router'
import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { App } from '@login/App'
import { IStoreState, createStore } from '@login/store'
import { IntlContainer } from '@login/i18n/components/I18nContainer'

configure({ adapter: new Adapter() })

export const mockState: IStoreState = createStore().store.getState()

export async function createTestApp() {
  const { store, history } = createStore()
  const app = mount(<App store={store} history={history} />)

  return { history, app, store }
}

export function createTestComponent(
  node: React.ReactElement,
  storeAndHistory?: ReturnType<typeof createStore>
) {
  storeAndHistory = storeAndHistory || createStore()
  const { store, history } = storeAndHistory

  return mount(
    <Provider store={store}>
      <IntlContainer>
        <ThemeProvider theme={getTheme()}>
          <Router history={history}>{node}</Router>
        </ThemeProvider>
      </IntlContainer>
    </Provider>
  )
}

export const wait = () => new Promise((res) => process.nextTick(res))
