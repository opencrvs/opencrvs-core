import * as React from 'react'
import { ThemeProvider } from 'styled-components'
// tslint:disable-next-line
const theme = require('./themes')
const locale = process.env.REACT_APP_LOCALE
  ? process.env.REACT_APP_LOCALE
  : 'gb'

export default class ThemeWrapper extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme.OpenCRVSTheme[locale]}>
        {this.props.children}
      </ThemeProvider>
    )
  }
}
