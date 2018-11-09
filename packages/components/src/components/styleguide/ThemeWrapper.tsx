import * as React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { getTheme } from '../theme'

const country = process.env.REACT_APP_COUNTRY
  ? process.env.REACT_APP_COUNTRY
  : 'gbr'

const Wrapper = styled.div`
  * {
    box-sizing: border-box;
  }
  /* stylelint-disable */
  background: #ebf1f3;
  /* stylelint-enable */
  padding: 2em;
`

export class ThemeWrapper extends React.Component {
  render() {
    return (
      <Wrapper>
        <ThemeProvider theme={getTheme(country)}>
          {this.props.children}
        </ThemeProvider>
      </Wrapper>
    )
  }
}

// Styleguidist's styleguideComponents configuration only works with components that are default exports
// See packages/components/styleguide.config.js:16
export { ThemeWrapper as default }
