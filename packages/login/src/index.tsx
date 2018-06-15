import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './App'
import registerServiceWorker from './registerserviceworker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
