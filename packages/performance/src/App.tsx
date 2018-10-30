import * as React from 'react'
import './App.css'

import { Header } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'

import { Page } from 'src/components/Page'
import styled, { ThemeProvider } from './styled-components'
import { config } from './config'
import Logo from './components/Logo'

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`

class App extends React.Component {
  public render() {
    return (
      <ThemeProvider theme={getTheme(config.COUNTRY)}>
        <Page>
          <StyledHeader>
            <Logo />
          </StyledHeader>
        </Page>
      </ThemeProvider>
    )
  }
}

export default App
