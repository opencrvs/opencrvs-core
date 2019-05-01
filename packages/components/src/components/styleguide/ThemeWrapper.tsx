import * as React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { getTheme } from '../theme'

const country = process.env.REACT_APP_COUNTRY
  ? process.env.REACT_APP_COUNTRY
  : 'gbr'

const language = process.env.REACT_APP_LANGUAGE
  ? process.env.REACT_APP_LANGUAGE
  : 'en'

const Wrapper = styled.div`
  * {
    box-sizing: border-box;
  }
  /* stylelint-disable */
  background: #ebf1f3;
  /* stylelint-enable */
  padding: 2em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: subpixel-antialiased;
  -moz-osx-font-smoothing: grayscale;
`

export class ThemeWrapper extends React.Component {
  render() {
    return (
      <Wrapper>
        <ThemeProvider theme={getTheme(country, language)}>
          {this.props.children}
        </ThemeProvider>
      </Wrapper>
    )
  }
}

// Styleguidist's styleguideComponents configuration only works with components that are default exports
// See packages/components/styleguide.config.js:16
export { ThemeWrapper as default }
