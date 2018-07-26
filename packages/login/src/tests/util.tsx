import * as React from 'react'
import { mount, configure, ReactWrapper } from 'enzyme'
import { Provider } from 'react-redux'
import * as Adapter from 'enzyme-adapter-react-16'
import configureStore from 'redux-mock-store'
import { App } from '../App'
import { IStoreState } from '../store'
import { initialState as loginState } from '../login/loginReducer'
import { initialState as intlState } from '../i18n/reducer'
import { addLocaleData, IntlProvider, intlShape } from 'react-intl'
import * as en from 'react-intl/locale-data/en'
import { ThemeProvider } from 'styled-components'
import { ENGLISH_STATE } from '../i18n/locales/en'
import { getTheme } from '@opencrvs/components/lib/theme'
import { config } from '../config'
import { store } from '../App'

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
      ],
      values: {
        code1: '1'
      }
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

function nodeWithIntlProp(node: React.ReactElement<ITestView>) {
  return React.cloneElement(node, { intl })
}

export function createTestComponent(node: React.ReactElement<ITestView>) {
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

export const wait = () => new Promise(res => process.nextTick(res))
