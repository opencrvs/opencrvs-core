import * as React from 'react'
import { mount, configure, ReactWrapper } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { App } from '../App'
import { IStoreState, AppStore } from '../store'
import { initialState as loginState } from '../login/loginReducer'
import { initialState as intlState } from '../i18n/intlReducer'

configure({ adapter: new Adapter() })

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
    MOCK_FORM: {
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

export const createTestComponent = (element: JSX.Element, store: AppStore) => {
  return mount(<Provider store={store}>{element}</Provider>)
}
