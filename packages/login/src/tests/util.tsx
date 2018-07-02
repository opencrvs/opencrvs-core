import * as React from 'react'
import { mount, configure } from 'enzyme'
import { App } from '../App'
import * as Adapter from 'enzyme-adapter-react-16'
import { IStoreState } from '../store'
import { initialState as loginState } from '../login/loginReducer'
import { initialState as intlState } from '../i18n/intlReducer'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'

configure({ adapter: new Adapter() })

export const mockStore = configureStore()
export const mockState: IStoreState = {
  login: loginState,
  router: {
    location: {
      pathname: '',
      search: '',
      hash: '',
      key: ''
    },
    action: 'PUSH'
  },
  form: {
    registeredFields: [
      {
        name: '',
        type: 'Field'
      }
    ]
  },
  i18n: intlState
}

export function createTestApp() {
  return mount(<App />)
}

export const createTestComponent = (element: JSX.Element, store: any) => {
  return mount(<Provider store={store}>{element}</Provider>)
}
