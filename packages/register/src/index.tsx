import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { injectGlobal } from 'styled-components'
import { App } from './App'
import registerServiceWorker from './registerServiceWorker'
import { createStore } from './store'
import * as actions from 'src/notification/actions'

// Injecting global styles for the body tag - used only once
// tslint:disable-next-line
injectGlobal`
  body {
    margin: 0;
    padding: 0;
  }
`

const { store, history } = createStore()

function onNewConentAvailable() {
  const action = actions.showNewContentAvailableNotification()
  store.dispatch(action)
}

ReactDOM.render(
  <App store={store} history={history} />,
  document.getElementById('root')
)
registerServiceWorker(onNewConentAvailable)
