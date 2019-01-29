import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { injectGlobal } from 'styled-components'
import { App } from './App'
import registerServiceWorker from './registerServiceWorker'
import { createStore } from './store'
import * as actions from 'src/notification/actions'
import { storage } from 'src/storage'

storage.configStorage('OpenCRVS')

// Injecting global styles for the body tag - used only once
// tslint:disable-next-line
injectGlobal`
  body {
    margin: 0;
    padding: 0;
  }
`

const { store, history } = createStore()

function onNewConentAvailable(waitingSW: ServiceWorker) {
  const action = actions.showNewContentAvailableNotification(waitingSW)
  store.dispatch(action)
}

function onBackGroundSync() {
  const channel = new BroadcastChannel(
    window.config.BACKGROUND_SYNC_BROADCAST_CHANNEL
  )
  channel.onmessage = e => {
    const syncCount = typeof e.data === 'number' ? e.data : 0
    const action = actions.showBackgroundSyncedNotification(syncCount)
    store.dispatch(action)
  }
}
onBackGroundSync()

ReactDOM.render(
  <App store={store} history={history} />,
  document.getElementById('root')
)
registerServiceWorker(onNewConentAvailable)
