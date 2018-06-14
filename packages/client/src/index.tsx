import * as React from 'react'
import * as ReactDOM from 'react-dom'
import styled, { injectGlobal } from 'styled-components'
import { App } from './App'
import registerServiceWorker from './registerServiceWorker'
import { Colors } from '@opencrvs/components/lib/Colors'
import { injectBodyStyle } from './utils/injectBodyStyle'

// Injecting global styles for @font-face and the body tag - used only once
// tslint:disable-next-line
injectGlobal`${injectBodyStyle}`

const StyledApp = styled(App)`
  background-color: ${Colors.background};
`

ReactDOM.render(<StyledApp />, document.getElementById('root'))
registerServiceWorker()
