import * as React from 'react'
import { mount, configure, ReactWrapper } from 'enzyme'
import { Provider } from 'react-redux'
import Adapter from 'enzyme-adapter-react-16'

import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { App, store } from '@login/App'
import { IStoreState, createStore } from '@login/store'
import { IntlContainer } from '@login/i18n/components/I18nContainer'
import { getDefaultLanguage } from '@login/i18n/utils'

configure({ adapter: new Adapter() })

export const mockState: IStoreState = createStore().getState()

export function createTestApp(): ReactWrapper<{}, {}> {
  return mount<App>(<App />)
}

export function createTestComponent(node: React.ReactElement<object>) {
  return mount(
    <Provider store={store}>
      <IntlContainer>
        <ThemeProvider theme={getTheme(getDefaultLanguage())}>
          {node}
        </ThemeProvider>
      </IntlContainer>
    </Provider>
  )
}

export const wait = () => new Promise(res => process.nextTick(res))
