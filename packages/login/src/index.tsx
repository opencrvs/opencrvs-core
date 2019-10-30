import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'
import * as LogRocket from 'logrocket'
import { App } from '@login/App'
import registerServiceWorker from '@login/registerServiceWorker'
import { storage } from '@login/storage'
import { createStore } from './store'

storage.configStorage('OpenCRVS')

if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  Sentry.init({
    dsn: window.config.SENTRY
  })

  // setup log rocket to ship log messages and record user errors
  LogRocket.init(window.config.LOGROCKET)

  // Integrate the two
  Sentry.configureScope(scope => {
    scope.addEventProcessor(async event => {
      if (!event.extra) {
        event.extra = {}
      }
      const sessionUrl = await new Promise(resolve => {
        LogRocket.getSessionURL(url => {
          resolve(url)
        })
      })
      event.extra.sessionURL = sessionUrl
      return event
    })
  })
}
const { store, history } = createStore()
ReactDOM.render(
  <App store={store} history={history} />,
  document.getElementById('root')
)
registerServiceWorker()
