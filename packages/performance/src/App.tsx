import * as React from 'react'
import './App.css'
import { Header, Box } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'
import { Bar, Legend } from '@opencrvs/components/lib/charts'
import { Provider } from 'react-redux'
import { Page } from 'src/components/Page'
import { History } from 'history'
import styled, { ThemeProvider } from './styled-components'
import { config } from './config'
import Logo from './components/Logo'
import { I18nContainer } from 'src/i18n/components/I18nContainer'
import { createStore, AppStore } from 'src/store'

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`
interface IAppProps {
  store: AppStore
  history: History
}
export const store = createStore()

const data = [
  {
    value: 500,
    label: 'Live births registered within 45 days of actual birth',
    description: '500 out of 3000 total'
  },
  {
    value: 1000,
    label: 'Live births registered within 1 year of actual birth',
    description: '1000 out of 3000 total'
  },
  {
    value: 3000,
    label: 'Total Live Births registered',
    description: '3000 out of estimated 4000',
    total: true
  },
  {
    value: 4000,
    label: 'Estimated Births in [time period]',
    estimate: true,
    description: 'Provided from 2018 population census'
  }
]

const ChartContainer = styled(Box)`
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
  margin: auto;
`

const Container = styled.div`
  padding: 20px 10px;
`

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <Provider store={this.props.store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(config.COUNTRY)}>
            <Page>
              <StyledHeader>
                <Logo />
              </StyledHeader>
              <Container>
                <ChartContainer>
                  <Bar data={data} />
                  <Legend data={data} />
                </ChartContainer>
              </Container>
            </Page>
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    )
  }
}
