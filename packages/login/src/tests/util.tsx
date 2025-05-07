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
import { mount, configure } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { App, routesConfig } from '@login/App'
import { IStoreState, createStore } from '@login/store'
import { IntlContainer } from '@login/i18n/components/I18nContainer'

configure({ adapter: new Adapter() })

export const mockState: IStoreState = createStore().store.getState()

type InitialEntry =
  | string
  | {
      pathname: string
      state: Record<
        string,
        string | boolean | number | Record<string, string | boolean | number>
      >
    }

export async function createTestApp({
  initialEntries
}: {
  initialEntries?: InitialEntry[]
} = {}) {
  const { store } = createStore()
  const router = createMemoryRouter(routesConfig, { initialEntries })

  const app = mount(<App store={store} router={router} />)

  return { router, app, store }
}

export function createTestComponent(
  node: React.ReactElement,
  {
    store,
    path,
    initialEntries
  }: { store?: any; initialEntries?: string[]; path?: string } | undefined = {}
) {
  const router = createMemoryRouter(
    [
      {
        path,
        element: node
      }
    ],
    { initialEntries }
  )

  const component = mount(
    <Provider store={store ?? createStore()?.store}>
      <IntlContainer>
        <ThemeProvider theme={getTheme()}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </IntlContainer>
    </Provider>
  )

  return { component, router }
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
