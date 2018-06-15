import * as React from 'react'
import * as ReactDOM from 'react-dom'
import styled, { injectGlobal } from 'styled-components'
import { App } from './App'
import registerServiceWorker from './registerserviceworker'
import { colors } from '../../components/lib/colors'
import { injectBodyStyle } from './utils/injectbodystyle'

// Injecting global styles for @font-face and the body tag - used only once
// tslint:disable-next-line
injectGlobal`${injectBodyStyle}`

const StyledApp = styled(App)`
  background-color: ${colors.background};
`

ReactDOM.render(<StyledApp />, document.getElementById('root'))
registerServiceWorker()
