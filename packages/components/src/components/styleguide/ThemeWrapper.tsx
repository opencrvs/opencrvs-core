import * as React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { getTheme } from '../theme'

const locale = process.env.REACT_APP_LOCALE
  ? process.env.REACT_APP_LOCALE
  : 'gb'

const Wrapper = styled.div`
  background: #ebf1f3;
  padding: 2em;
`

export class ThemeWrapper extends React.Component {
  render() {
    return (
      <Wrapper>
        <ThemeProvider theme={getTheme(locale)}>
          {this.props.children}
        </ThemeProvider>
      </Wrapper>
    )
  }
}

// Styleguidist's styleguideComponents configuration only works with components that are default exports
// See packages/components/styleguide.config.js:16
export { ThemeWrapper as default }
