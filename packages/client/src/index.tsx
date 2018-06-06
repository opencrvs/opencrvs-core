import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { globalStyles } from '@opencrvs/components/lib/common/global'
import { injectGlobal } from 'styled-components'
import { App } from './App'
import registerServiceWorker from './registerServiceWorker'

// Injecting global styles for @font-face and the body tag - used only once
// tslint:disable-next-line
injectGlobal`${globalStyles}`

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
