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
import { createStore } from './store'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import React from 'react'
import { registerScopeToken } from './mocks/tokens'
import { createClient } from './utils/apolloClient'

test('App loads', async () => {
  const { store, history } = createStore()
  const apolloClient = createClient(store)
  window.history.replaceState('', '', '?token=' + registerScopeToken)
  render(<App store={store} history={history} client={apolloClient} />)
  await screen.findByRole('heading')
  expect(screen.getByRole('heading')).toHaveTextContent(/create a pin/i)
})
