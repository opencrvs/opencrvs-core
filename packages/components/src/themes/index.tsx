import * as React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'

const locale = (process.env.REACT_APP_LOCALE =
  process.env.REACT_APP_LOCALE || 'gb')

export default class ThemeWrapper extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme[locale]}>{this.props.children}</ThemeProvider>
    )
  }
}
