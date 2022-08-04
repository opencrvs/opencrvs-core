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

export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

const MAX_TIME = process.env.CI ? 10000 : 2000
const INTERVAL = 10

export async function waitFor(condition: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    let remainingTime = MAX_TIME

    const intervalId = setInterval(() => {
      if (remainingTime < 0) {
        clearInterval(intervalId)
        return reject(
          new Error(
            `Condition was not met in ${MAX_TIME}ms: \n\n${condition.toString()}`
          )
        )
      }

      let result = false
      try {
        result = condition()
      } catch (err) {}

      if (result) {
        clearInterval(intervalId)
        return resolve()
      }

      remainingTime = remainingTime - INTERVAL
    }, INTERVAL)
  })
}
