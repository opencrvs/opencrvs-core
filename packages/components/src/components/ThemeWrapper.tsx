import * as React from 'react'
import {ThemeProvider} from 'styled-components'
import {LocaleThemes} from './common/global/LocaleThemes'
const locale = process.env.REACT_APP_LOCALE
  ? process.env.REACT_APP_LOCALE
  : 'gb'

export class ThemeWrapper extends React.Component {
  render() {
    return <ThemeProvider theme={LocaleThemes[locale]}>{this.props.children}</ThemeProvider>
  }
}
