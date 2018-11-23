import * as React from 'react'
import { Provider } from 'react-redux'
import {
  IStoreState,
  createStore,
  AppStore
} from '@opencrvs/performance/src/store'
import { mount, configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { ENGLISH_STATE } from '@opencrvs/performance/src/i18n/locales/en'
import { IntlProvider, intlShape } from 'react-intl'
import { I18nContainer } from '@opencrvs/performance/src/i18n/components/I18nContainer'
import { config } from '../config'

configure({ adapter: new Adapter() })

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}
interface ITestView {
  intl: ReactIntl.InjectedIntl
}

const intlProvider = new IntlProvider(
  { locale: 'en', messages: ENGLISH_STATE.messages },
  {}
)

const { intl } = intlProvider.getChildContext()

function nodeWithIntlProp(node: React.ReactElement<ITestView>) {
  return React.cloneElement(node, { intl })
}

export function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: AppStore
) {
  const component = mount(
    <Provider store={store}>
      <I18nContainer>
        <ThemeProvider theme={getTheme(config.COUNTRY)}>
          {nodeWithIntlProp(node)}
        </ThemeProvider>
      </I18nContainer>
    </Provider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )

  return { component, store }
}
