import type { Preview } from '@storybook/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nContainer } from '../src/i18n/components/I18nContainer'
import { Provider } from 'react-redux'
import { createStore } from '../src/store'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'

const { store } = createStore()

const preview: Preview = {
  parameters: {},
  decorators: [
    (Story) => (
      <ThemeProvider theme={getTheme}>
        <Provider store={store}>
          <I18nContainer>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </I18nContainer>
        </Provider>
      </ThemeProvider>
    )
  ]
}

export default preview
