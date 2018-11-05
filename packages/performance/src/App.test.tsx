import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './App'
import { createStore } from 'src/store'

const { store, history } = createStore()

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App store={store} history={history} />, div)
  ReactDOM.unmountComponentAtNode(div)
})
