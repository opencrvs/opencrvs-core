import { IStoreState, createStore } from '../store'
import * as en from 'react-intl/locale-data/en'
import { configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { addLocaleData } from 'react-intl'

configure({ adapter: new Adapter() })

addLocaleData([...en])

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}
