import * as React from 'react'
import { mount, configure } from 'enzyme'
import { App } from '../App'
import * as Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

export function createTestApp() {
  return mount(<App />)
}
