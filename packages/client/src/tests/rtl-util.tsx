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
import { createStore } from '@client/store'
import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '@client/App'
import React from 'react'
import {
  fieldAgentScopeToken,
  registerScopeToken,
  registrationAgentScopeToken
} from '@client/mocks/sources/tokens'
import { createClient } from '@client/utils/apolloClient'
import { server } from '@client/mocks/setupServer'
import {
  fieldAgentResponse,
  registrarResponse,
  registrationAgentResponse
} from '@client/mocks/sources/userResponses'
import { HttpResponse, graphql } from 'msw'
import { FetchUserQuery, FetchUserQueryVariables } from '@client/utils/gateway'
import { merge } from 'lodash'

const userDetails = {
  registrar: {
    fetchUser: registrarResponse,
    token: registerScopeToken
  },
  fieldAgent: {
    fetchUser: fieldAgentResponse,
    token: fieldAgentScopeToken
  },
  registrationAgent: {
    fetchUser: registrationAgentResponse,
    token: registrationAgentScopeToken
  }
}

const defaultConfig: Required<NonNullable<Parameters<typeof loginAs>[1]>> = {
  createPin: true
}

export async function loginAs(
  role: 'registrar' | 'fieldAgent' | 'registrationAgent',
  userConfig?: {
    createPin?: boolean
  }
) {
  const config = merge(defaultConfig, userConfig)
  const { store, history } = createStore()
  const apolloClient = createClient(store)
  server.use(
    graphql.query<FetchUserQuery, FetchUserQueryVariables>('fetchUser', () => {
      return HttpResponse.json(
        {
          data: userDetails[role].fetchUser
        },
        {
          headers: {
            'X-Version': '1.5.0'
          }
        }
      )
    })
  )
  window.history.replaceState('', '', '?token=' + userDetails[role].token)
  render(<App store={store} history={history} client={apolloClient} />)
  if (config.createPin) {
    await screen.findByText(
      /Choose a PIN that doesn't have 4 repeating digits or sequential numbers/
    )
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '50'
    })
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '50'
    })
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '49'
    })
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '49'
    })
    await screen.findByText(/Let's make sure we collected your PIN correctly/)
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '50'
    })
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '50'
    })
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '49'
    })
    fireEvent.keyDown(document.activeElement || document.body, {
      keyCode: '49'
    })
  }
}
