import * as React from 'react'
import { connect } from 'react-redux'
import {
  InjectedIntlProps,
  injectIntl,
  InjectedIntl,
  FormattedHTMLMessage,
  defineMessages
} from 'react-intl'
import { Header, Box } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import { Logo } from '@opencrvs/components/lib/icons'
import { Page } from 'src/components/Page'

import { Legend, VerticalBar, Line } from '@opencrvs/components/lib/charts'

const messages = defineMessages({
  birthRegistrationBoxTitle: {
    id: 'performance.graph.birthRegistrationBoxTitle',
    defaultMessage: 'Birth Registration Key Figures',
    description: 'Title for the birth registration key figures box.'
  },
  birthRegistrationBoxFooter: {
    id: 'performance.graph.birthRegistrationBoxFooter',
    defaultMessage: 'Estimates provided using National Population Census data',
    description: 'Title for the birth registration key figures box footer.'
  },
  liveBirthsWithin45DaysLabel: {
    id: 'performance.graph.liveBirthsWithin45DaysLabel',
    defaultMessage: 'Registrations within<br />45 days of birth',
    description:
      'Live births registered within 45 days of actual birth label on graph'
  },
  liveBirthsWithin45DaysDescription: {
    id: 'performance.graph.liveBirthsWithin45DaysDescription',
    defaultMessage: '142500 out of 204000',
    description:
      'Live births registered within 45 days of actual birth description on graph'
  },
  liveBirthsWithin1yearLabel: {
    id: 'performance.graph.liveBirthsWithin1yearLabel',
    defaultMessage: 'Registrations within<br />1 year of birth',
    description:
      'Live births registered within 1 year of actual birth label on graph'
  },
  liveBirthsWithin1yearDescription: {
    id: 'performance.graph.liveBirthsWithin1yearDescription',
    defaultMessage: '61500 out of 204000',
    description:
      'Live births registered within 1 year of actual birth description on graph'
  },
  totalLiveBirthsLabel: {
    id: 'performance.graph.totalLiveBirthsLabel',
    defaultMessage: 'Total Live Births registered',
    description: 'Total live births label on graph'
  },
  estimatedBirthsInTimeLabel: {
    id: 'performance.graph.estimatedBirthsInTimeLabel',
    defaultMessage: 'Estimated Births in [time period]',
    description: 'Estimated births in time period label on graph'
  },
  estimatedBirthsInTimeDescription: {
    id: 'performance.graph.estimatedBirthsInTimeDescription',
    defaultMessage: 'Provided from 2018 population census',
    description: 'Estimated births in time period description on graph'
  },
  birthRegistrationBarChartBoxTitle: {
    id: 'performance.graph.birthRegistrationBarChartBoxWithin10YearsTitle',
    defaultMessage:
      'At What Age Are Births Registered In Children Aged 0-10 Years',
    description: 'Title for birth registration bar chart box'
  },
  birthRegistrationBarChartInAgesLabel: {
    id: 'performance.graph.birthRegistrationInAgesLabel',
    defaultMessage: 'Age (years)',
    description: 'The label for x-axis of birth registration bar chart'
  },
  birthRegistrationPercentageLabel: {
    id: 'performance.graph.birthRegistrationPercentageLabel',
    defaultMessage: 'Total Births Registered (%)',
    description: 'The label for y-axis of birth registration bar chart'
  },
  birthRegistrationRateWithin45DaysBoxTitle: {
    id: 'performance.graph.birthRegistrationRateWithin45DaysTitle',
    defaultMessage: 'Birth Rate For Registrations Within 45 Days',
    description:
      'The label for birth registration rate within 45 days per month line chart box'
  },
  birthRegistrationRatePerMonthLabel: {
    id: 'performance.graph.birthRegistrationRatePerMonthLabel',
    defaultMessage: 'Calendar Month',
    description:
      'The x-axis label for birth registration rate within 45 days per month line chart'
  },
  birthRegistrationPercentageOfEstimateLabel: {
    id: 'performance.graph.birthRegistrationPercentageOfEstimateLabel',
    defaultMessage: 'Birth Registration % of estimate',
    description:
      'The y-axis label for birth registration rate within 45 days per month line chart'
  }
})

interface IData {
  value: number
  label: React.ReactNode
  description?: string
  total?: boolean
  estimate?: boolean
}

const getData = (intl: InjectedIntl): IData[] => {
  return [
    {
      value: 142500,
      label: (
        <FormattedHTMLMessage
          id="graph.label1"
          defaultMessage={intl.formatHTMLMessage(
            messages.liveBirthsWithin45DaysLabel
          )}
        />
      ),
      description: intl.formatMessage(
        messages.liveBirthsWithin45DaysDescription
      )
    },
    {
      value: 61500,
      label: (
        <FormattedHTMLMessage
          id="graph.label2"
          defaultMessage={intl.formatHTMLMessage(
            messages.liveBirthsWithin1yearLabel
          )}
        />
      ),
      description: intl.formatMessage(messages.liveBirthsWithin1yearDescription)
    },
    {
      value: 204000,
      label: (
        <FormattedHTMLMessage
          id="graph.label3"
          defaultMessage={intl.formatHTMLMessage(messages.totalLiveBirthsLabel)}
        />
      ),
      total: true
    }
  ]
}

const birthRegistrationData = [
  { label: '45d', value: 2100 },
  { label: '46d - 1yr', value: 2400 },
  { label: '1', value: 1398 },
  { label: '2', value: 6800 },
  { label: '3', value: 3908 },
  { label: '4', value: 4800 },
  { label: '5', value: 3800 },
  { label: '6', value: 4300 },
  { label: '7', value: 2500 },
  { label: '8', value: 5680 },
  { label: '9', value: 4980 },
  { label: '10', value: 2570 }
]

const birthRegistrationDataPerMonth = [
  { label: 'Jan', value: 2100, totalEstimate: 10000 },
  { label: 'Feb', value: 2400, totalEstimate: 10000 },
  { label: 'Mar', value: 1398, totalEstimate: 10000 },
  { label: 'Apr', value: 6800, totalEstimate: 10000 },
  { label: 'May', value: 3908, totalEstimate: 10000 },
  { label: 'Jun', value: 4800, totalEstimate: 10000 },
  { label: 'Jul', value: 3800, totalEstimate: 10000 },
  { label: 'Aug', value: 4300, totalEstimate: 10000 },
  { label: 'Sep', value: 2500, totalEstimate: 10000 },
  { label: 'Oct', value: 5680, totalEstimate: 10000 },
  { label: 'Nov', value: 4980, totalEstimate: 10000 },
  { label: 'Dec', value: 8570, totalEstimate: 10000 }
]

const StyledHeader = styled(Header)`
  padding: 25px;
  box-shadow: none;
`

const BoxTitle = styled.div`
  line-height: 25px;
  text-transform: capitalize !important;
  ${({ theme }) => theme.fonts.h2FontStyle}
  color: ${({ theme }) => theme.colors.primary};
`

const FooterText = styled.div`
  height: 17px;
  line-height: 17px;
  margin-top: 25px;
  ${({ theme }) => theme.fonts.infoFontStyle}
  color: ${({ theme }) => theme.colors.copy};
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

const LabelContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: row wrap;
  padding: 20px 0;
  color: ${({ theme }) => theme.colors.copy};
  width: 100%;
`
const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 10px 2px 0;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  align-items: center;
  height: 32px;
  & span {
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 13px;
  }
`

class HomeView extends React.Component<InjectedIntlProps> {
  render() {
    const { intl } = this.props
    return (
      <Page>
        <StyledHeader>
          <Logo />
        </StyledHeader>
        <Container>
          <ChartContainer>
            <BoxTitle id="box_title">
              {intl.formatMessage(messages.birthRegistrationBoxTitle)}
            </BoxTitle>
            <Legend data={getData(intl)} smallestToLargest={false} />
            <FooterText id="footer_text">
              {intl.formatMessage(messages.birthRegistrationBoxFooter)}
            </FooterText>
          </ChartContainer>
          <ChartContainer>
            <BoxTitle id="bar_chart_box_title">
              {intl.formatMessage(messages.birthRegistrationBarChartBoxTitle)}
            </BoxTitle>
            <VerticalBar
              data={birthRegistrationData}
              xAxisLabel={intl.formatMessage(
                messages.birthRegistrationBarChartInAgesLabel
              )}
              yAxisLabel={intl.formatMessage(
                messages.birthRegistrationPercentageLabel
              )}
            />
          </ChartContainer>
          <ChartContainer>
            <BoxTitle id="line_chart_box_title">
              {intl.formatMessage(
                messages.birthRegistrationRateWithin45DaysBoxTitle
              )}
            </BoxTitle>
            <LabelContainer>
              <Label>2018 estimate = 10000</Label>
            </LabelContainer>
            <Line
              data={birthRegistrationDataPerMonth}
              xAxisLabel={intl.formatMessage(
                messages.birthRegistrationRatePerMonthLabel
              )}
              yAxisLabel={intl.formatMessage(
                messages.birthRegistrationPercentageOfEstimateLabel
              )}
            />
          </ChartContainer>
        </Container>
      </Page>
    )
  }
}

export const Home = connect(
  null,
  null
)(injectIntl(HomeView))
