import * as React from 'react'
import { mount, configure, ReactWrapper } from 'enzyme'
import { Provider } from 'react-redux'
import * as Adapter from 'enzyme-adapter-react-16'
import configureStore, { MockStoreEnhanced } from 'redux-mock-store'
import { App } from '../App'
import { IStoreState } from '../store'
import { initialState as loginState } from '../login/loginReducer'
import { initialState as intlState } from '../i18n/intlReducer'
import { addLocaleData, IntlProvider, intlShape } from 'react-intl'
import * as en from 'react-intl/locale-data/en'
import { ThemeProvider } from 'styled-components'
import { ENGLISH_STATE } from '../i18n/en'
import { getTheme } from '@opencrvs/components/lib/theme'
import { config } from '../config'

configure({ adapter: new Adapter() })
addLocaleData([...en])

export const mockStore = configureStore()
export const mockState: IStoreState = {
  login: loginState,
  router: {
    location: {
      pathname: '',
      search: '',
      hash: '',
      state: '',
      key: ''
    }
  },
  form: {
    STEP_ONE: {
      registeredFields: [
        {
          name: '',
          type: 'Field'
        }
      ]
    },
    STEP_TWO: {
      registeredFields: [
        {
          name: '',
          type: 'Field'
        }
      ]
    }
  },
  i18n: intlState
}

export function createTestApp(): ReactWrapper<{}, {}> {
  return mount<App>(<App />)
}

interface ITestView {
  intl: ReactIntl.InjectedIntl
}

const intlProvider = new IntlProvider(
  { locale: 'en', messages: ENGLISH_STATE.messages },
  {}
)
const { intl } = intlProvider.getChildContext()

export const createTestState = (initialState: IStoreState): MockStoreEnhanced =>
  mockStore(initialState)

function nodeWithIntlProp(node: React.ReactElement<ITestView>) {
  return React.cloneElement(node, { intl })
}

export function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: MockStoreEnhanced
) {
  return mount(
    <Provider store={store}>
      <ThemeProvider theme={getTheme(config.LOCALE)}>
        {nodeWithIntlProp(node)}
      </ThemeProvider>
    </Provider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )
}
