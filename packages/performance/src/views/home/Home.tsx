import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Header, Box } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import Logo from 'src/components/Logo'
import { Page } from 'src/components/Page'
import { Bar, Legend, VerticalBar } from '@opencrvs/components/lib/charts'

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

const birthRegistrationData = [
  { name: '45d', value: 2100 },
  { name: '46d - 1yr', value: 2400 },
  { name: '1', value: 1398 },
  { name: '2', value: 6800 },
  { name: '3', value: 3908 },
  { name: '4', value: 4800 },
  { name: '5', value: 3800 },
  { name: '6', value: 4300 },
  { name: '7', value: 2500 },
  { name: '8', value: 5680 },
  { name: '9', value: 4980 },
  { name: '10', value: 2570 }
]

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`

const ChartContainer = styled(Box)`
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
  margin: auto;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`

const Container = styled.div`
  padding: 20px 10px;
`
class HomeView extends React.Component<InjectedIntlProps> {
  render() {
    return (
      <Page>
        <StyledHeader>
          <Logo />
        </StyledHeader>
        <Container>
          <ChartContainer>
            <Bar data={data} />
            <Legend data={data} />
          </ChartContainer>
          <ChartContainer>
            <VerticalBar
              data={birthRegistrationData}
              xAxisLabel="Age(years)"
              yAxisLabel="Total Births Registered (%)"
            />
          </ChartContainer>
        </Container>
      </Page>
    )
  }
}

export const Home = connect(null, null)(injectIntl(HomeView))
