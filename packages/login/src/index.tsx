import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { injectGlobal } from 'styled-components'
import * as Sentry from '@sentry/browser'
import * as LogRocket from 'logrocket'
import { App } from '@login/App'
import registerServiceWorker from '@login/registerServiceWorker'

// Injecting global styles for the body tag - used only once
// @ts-ignore
injectGlobal`
  body {
    margin: 0;
    padding: 0;
  }
`

if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  Sentry.init({
    dsn: 'https://8f6ba426b20045f1b91528d5fdc214b5@sentry.io/1401900'
  })

  // setup log rocket to ship log messages and record user errors
  LogRocket.init('hxf1hb/opencrvs')

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

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
