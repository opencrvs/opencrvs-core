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

import { getTheme } from '@opencrvs/components/lib/theme'
import type { Preview } from '@storybook/react'
import { initialize, mswLoader } from 'msw-storybook-addon'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { Page } from '../src/components/Page'
import { I18nContainer } from '../src/i18n/components/I18nContainer'
import { createStore } from '../src/store'
import { useApolloClient } from '../src/utils/apolloClient'
import { ApolloProvider } from '../src/utils/ApolloProvider'
import { handlers } from './default-request-handlers'

// Initialize MSW
initialize({
  onUnhandledRequest(req, print) {
    if (
      new URL(req.url).pathname.startsWith('/src/') ||
      new URL(req.url).pathname.startsWith('/@fs') ||
      new URL(req.url).pathname.startsWith('/node_modules') ||
      new URL(req.url).pathname.startsWith('/images')
    ) {
      return
    }

    print.warning()
  }
})

const { store } = createStore()

interface WrapperProps {
  children: React.ReactNode
  store: ReturnType<typeof createStore>['store']
}

function Wrapper({ children, store }: WrapperProps) {
  const { client } = useApolloClient(store)

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={getTheme}>
        <Provider store={store}>
          <I18nContainer>
            <MemoryRouter>
              <Page>{children}</Page>
            </MemoryRouter>
          </I18nContainer>
        </Provider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export const parameters = {
  msw: {
    handlers: handlers
  }
}

const preview: Preview = {
  loaders: [mswLoader],
  beforeEach: async () => {
    window.localStorage.setItem(
      'opencrvs',
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'
    )
  },
  decorators: [
    (Story) => (
      <Wrapper store={store}>
        <Story />
      </Wrapper>
    )
  ]
}

export default preview
